use keyring::Entry;
use reqwest::{Client, Url};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager, State};

use crate::offline_auth::{self, DesktopAuthState};

const DB_FILE_NAME: &str = "waste-x-local.db";
const DATABASE_KEYRING_SERVICE: &str = "com.wastex.desktop.local-database";
const DATABASE_KEYRING_ACCOUNT: &str = "database-key-v1";
const CLOUD_KEYRING_SERVICE: &str = "com.wastex.desktop.cloud-credentials";
const CLOUD_KEYRING_ACCOUNT: &str = "credentials-v1";

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CloudCredentials {
    device_secret: String,
    session_token: String,
    session_expires_at: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudCatalogueInput {
    query: Option<String>,
    offset: Option<i64>,
    limit: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudContext {
    base_url: String,
    environment: String,
    organisation_id: Option<String>,
    organisation_name: Option<String>,
    device_id: Option<String>,
    default_site_id: Option<String>,
    default_site_name: Option<String>,
    display_name: Option<String>,
    horizon_start: Option<String>,
    horizon_end: Option<String>,
    last_bootstrap_at: Option<String>,
}

fn cloud_base_url() -> String {
    option_env!("WASTE_X_DESKTOP_API_BASE_URL")
        .unwrap_or("http://localhost:3000")
        .trim_end_matches('/')
        .to_string()
}

fn environment_label(base_url: &str) -> String {
    let lower = base_url.to_lowercase();
    if lower.contains("localhost") || lower.contains("127.0.0.1") {
        "LOCAL DEVELOPMENT".to_string()
    } else if lower.contains("demo") {
        "DEMO".to_string()
    } else if lower.contains("vercel.app") {
        "CLOUD PREVIEW".to_string()
    } else {
        "PRODUCTION".to_string()
    }
}

fn open_local_connection(app: &AppHandle) -> Result<Connection, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve Waste X application data directory: {e}"))?;
    let path = app_data_dir.join(DB_FILE_NAME);

    let entry = Entry::new(DATABASE_KEYRING_SERVICE, DATABASE_KEYRING_ACCOUNT)
        .map_err(|e| format!("Could not access the OS credential store: {e}"))?;
    let key = entry
        .get_password()
        .map_err(|e| format!("Could not read the Waste X database key: {e}"))?;

    let connection = Connection::open(path)
        .map_err(|e| format!("Could not open the Waste X local database: {e}"))?;
    connection
        .execute_batch(&format!(
            "PRAGMA key = \"x'{key}'\";\n             PRAGMA foreign_keys = ON;\n             PRAGMA journal_mode = WAL;\n             PRAGMA synchronous = FULL;\n             PRAGMA busy_timeout = 5000;"
        ))
        .map_err(|e| format!("Could not unlock the Waste X local database: {e}"))?;
    Ok(connection)
}

fn metadata(connection: &Connection, key: &str) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT value FROM local_sync_metadata WHERE key = ?1",
            params![key],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())
}

fn load_cloud_credentials() -> Result<CloudCredentials, String> {
    let entry = Entry::new(CLOUD_KEYRING_SERVICE, CLOUD_KEYRING_ACCOUNT)
        .map_err(|e| format!("Could not access the OS credential store for Waste X Cloud: {e}"))?;
    let encoded = entry
        .get_password()
        .map_err(|e| format!("Waste X Cloud credentials are unavailable: {e}"))?;
    serde_json::from_str(&encoded)
        .map_err(|e| format!("Stored Waste X Cloud credentials are invalid: {e}"))
}

#[tauri::command]
pub fn desktop_cloud_context(
    app: AppHandle,
    auth_state: State<'_, DesktopAuthState>,
) -> Result<CloudContext, String> {
    offline_auth::require_unlocked(&auth_state)?;
    let connection = open_local_connection(&app)?;
    let row = connection
        .query_row(
            "SELECT device_id, organisation_id, default_site_id, display_name
             FROM local_device_configuration WHERE singleton_id = 1",
            [],
            |row| {
                Ok((
                    row.get::<_, Option<String>>(0)?,
                    row.get::<_, Option<String>>(1)?,
                    row.get::<_, Option<String>>(2)?,
                    row.get::<_, Option<String>>(3)?,
                ))
            },
        )
        .optional()
        .map_err(|e| e.to_string())?
        .unwrap_or((None, None, None, None));

    let organisation_name = connection
        .query_row(
            "SELECT payload_json FROM local_organisation WHERE id = ?1",
            params![row.1.as_deref().unwrap_or("")],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(|e| e.to_string())?
        .and_then(|payload| serde_json::from_str::<Value>(&payload).ok())
        .and_then(|payload| {
            payload
                .get("teamName")
                .and_then(Value::as_str)
                .map(ToOwned::to_owned)
        });

    let default_site_name = match row.2.as_deref() {
        Some(site_id) => connection
            .query_row(
                "SELECT name FROM local_site WHERE id = ?1 AND organisation_id = ?2",
                params![site_id, row.1.as_deref().unwrap_or("")],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(|e| e.to_string())?,
        None => None,
    };

    let base_url = cloud_base_url();
    Ok(CloudContext {
        environment: environment_label(&base_url),
        base_url,
        device_id: row.0,
        organisation_id: row.1,
        default_site_id: row.2,
        default_site_name,
        display_name: row.3,
        organisation_name,
        horizon_start: metadata(&connection, "bootstrap_horizon_start")?,
        horizon_end: metadata(&connection, "bootstrap_horizon_end")?,
        last_bootstrap_at: metadata(&connection, "last_bootstrap_at")?,
    })
}

#[tauri::command]
pub async fn desktop_cloud_catalogue(
    auth_state: State<'_, DesktopAuthState>,
    input: CloudCatalogueInput,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;
    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();
    let mut url = Url::parse(&format!("{base_url}/api/desktop/v1/organisation/catalogue"))
        .map_err(|e| format!("Waste X Cloud URL is invalid: {e}"))?;

    {
        let mut pairs = url.query_pairs_mut();
        if let Some(query) = input
            .query
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            pairs.append_pair("q", query);
        }
        pairs.append_pair("offset", &input.offset.unwrap_or(0).max(0).to_string());
        pairs.append_pair(
            "limit",
            &input.limit.unwrap_or(50).clamp(1, 100).to_string(),
        );
    }

    let response = Client::new()
        .get(url)
        .bearer_auth(&credentials.session_token)
        .header("X-Waste-X-Device-Secret", &credentials.device_secret)
        .send()
        .await
        .map_err(|e| format!("Waste X Cloud organisation view is unavailable: {e}"))?;
    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| format!("Waste X Cloud organisation view returned unreadable data: {e}"))?;

    if !status.is_success() {
        let message = body
            .get("error")
            .and_then(|value| value.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("Waste X Cloud rejected the organisation view request.");
        return Err(format!("{message} [HTTP {status}]"));
    }

    Ok(body)
}

/* WASTE_X_DESKTOP_JOB_CREATION_V1 */

fn cloud_api_error(body: &Value, fallback: &str) -> String {
    body.get("error")
        .and_then(|value| value.get("message"))
        .and_then(Value::as_str)
        .unwrap_or(fallback)
        .to_string()
}

#[tauri::command]
pub async fn desktop_job_options(
    auth_state: State<'_, DesktopAuthState>,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .get(format!(
            "{base_url}/api/desktop/v1/operations/job-options"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud Job options are unavailable: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud Job options returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the Job options request.",
            )
        ));
    }

    Ok(body)
}

#[tauri::command]
pub async fn desktop_create_job(
    auth_state: State<'_, DesktopAuthState>,
    input: Value,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .post(format!(
            "{base_url}/api/desktop/v1/operations/jobs"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .json(&input)
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud could not create the Job: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud Job creation returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the Job.",
            )
        ));
    }

    Ok(body)
}

/* WASTE_X_DESKTOP_RECORD_HISTORY_V1 */

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudJobHistoryInput {
    job_id: String,
}

#[tauri::command]
pub async fn desktop_cloud_job_history(
    auth_state: State<'_, DesktopAuthState>,
    input: CloudJobHistoryInput,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let job_id = input.job_id.trim();
    if job_id.is_empty() {
        return Err("Choose a Waste X Job to inspect its record history.".to_string());
    }

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();
    let mut url = Url::parse(&format!(
        "{base_url}/api/desktop/v1/organisation/history"
    ))
    .map_err(|e| format!("Waste X Cloud history URL is invalid: {e}"))?;

    url.query_pairs_mut().append_pair("jobId", job_id);

    let response = Client::new()
        .get(url)
        .bearer_auth(&credentials.session_token)
        .header("X-Waste-X-Device-Secret", &credentials.device_secret)
        .send()
        .await
        .map_err(|e| format!("Waste X Cloud record history is unavailable: {e}"))?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud record history returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the record-history request.",
            )
        ));
    }

    Ok(body)
}

/* WASTE_X_DESKTOP_TRANSPORT_MASTER_DATA_V1 */

#[tauri::command]
pub async fn desktop_transport_master_data(
    auth_state: State<'_, DesktopAuthState>,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .get(format!(
            "{base_url}/api/desktop/v1/operations/transport"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud transport master data is unavailable: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud transport master data returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the transport master-data request.",
            )
        ));
    }

    Ok(body)
}

#[tauri::command]
pub async fn desktop_mutate_transport_master_data(
    auth_state: State<'_, DesktopAuthState>,
    input: Value,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .post(format!(
            "{base_url}/api/desktop/v1/operations/transport"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .json(&input)
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud could not save transport master data: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud transport update returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the Driver / Vehicle change.",
            )
        ));
    }

    Ok(body)
}

/* WASTE_X_DESKTOP_PARTNER_MASTER_DATA_V1 */

#[tauri::command]
pub async fn desktop_partner_master_data(
    auth_state: State<'_, DesktopAuthState>,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .get(format!(
            "{base_url}/api/desktop/v1/operations/partners"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud partner master data is unavailable: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud partner data returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the partner master-data request.",
            )
        ));
    }

    Ok(body)
}

#[tauri::command]
pub async fn desktop_mutate_partner_master_data(
    auth_state: State<'_, DesktopAuthState>,
    input: Value,
) -> Result<Value, String> {
    offline_auth::require_unlocked(&auth_state)?;

    let credentials = load_cloud_credentials()?;
    let base_url = cloud_base_url();

    let response = Client::new()
        .post(format!(
            "{base_url}/api/desktop/v1/operations/partners"
        ))
        .bearer_auth(&credentials.session_token)
        .header(
            "X-Waste-X-Device-Secret",
            &credentials.device_secret,
        )
        .json(&input)
        .send()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud could not save partner master data: {e}"
            )
        })?;

    let status = response.status();
    let body = response
        .json::<Value>()
        .await
        .map_err(|e| {
            format!(
                "Waste X Cloud partner update returned unreadable data: {e}"
            )
        })?;

    if !status.is_success() {
        return Err(format!(
            "{} [HTTP {status}]",
            cloud_api_error(
                &body,
                "Waste X Cloud rejected the company / site change.",
            )
        ));
    }

    Ok(body)
}
