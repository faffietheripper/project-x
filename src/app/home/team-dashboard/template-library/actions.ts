"use server";

import { database } from "@/db/database";
import {
  listingTemplates,
  listingTemplateSections,
  listingTemplateFields,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireOrgUser } from "@/lib/access/require-org-user";

/* =========================================================
   CREATE TEMPLATE
========================================================= */

export async function createTemplate(name: string, description?: string) {
  const user = await requireOrgUser();

  const [template] = await database
    .insert(listingTemplates)
    .values({
      organisationId: user.organisationId,
      name,
      description,
      createdByUserId: user.userId,
    })
    .returning();

  return template; // returning plain row
}

/* =========================================================
   GET ORG TEMPLATES
========================================================= */

export async function getOrgTemplates() {
  const user = await requireOrgUser();

  const templates = await database
    .select()
    .from(listingTemplates)
    .where(eq(listingTemplates.organisationId, user.organisationId));

  return templates;
}

/* =========================================================
   ADD SECTION
========================================================= */

export async function addSection(templateId: string, title: string) {
  await requireOrgUser();
  await ensureTemplateEditable(templateId);

  const existingSections = await database
    .select()
    .from(listingTemplateSections)
    .where(eq(listingTemplateSections.templateId, templateId));

  const nextOrder =
    existingSections.length === 0
      ? 1
      : Math.max(...existingSections.map((s) => s.orderIndex)) + 1;

  const [section] = await database
    .insert(listingTemplateSections)
    .values({
      templateId,
      title,
      orderIndex: nextOrder,
    })
    .returning();

  return section;
}

/* =========================================================
   DELETE SECTION
========================================================= */

export async function deleteSection(sectionId: string) {
  await requireOrgUser();

  const section = await database
    .select()
    .from(listingTemplateSections)
    .where(eq(listingTemplateSections.id, sectionId));

  await ensureTemplateEditable(section[0].templateId);

  // First delete fields inside section
  await database
    .delete(listingTemplateFields)
    .where(eq(listingTemplateFields.sectionId, sectionId));

  // Then delete section
  await database
    .delete(listingTemplateSections)
    .where(eq(listingTemplateSections.id, sectionId));

  return { success: true };
}

/* =========================================================
   ADD FIELD
========================================================= */

export async function addFieldToSection({
  templateId,
  sectionId,
  key,
  label,
  fieldType,
  required,
}: {
  templateId: string;
  sectionId: string;
  key: string;
  label: string;
  fieldType: "text" | "number" | "dropdown" | "boolean" | "file";
  required?: boolean;
}) {
  await requireOrgUser();
  await ensureTemplateEditable(templateId);

  const existingFields = await database
    .select()
    .from(listingTemplateFields)
    .where(eq(listingTemplateFields.sectionId, sectionId));

  const nextOrder =
    existingFields.length === 0
      ? 1
      : Math.max(...existingFields.map((f) => f.orderIndex)) + 1;

  const [field] = await database
    .insert(listingTemplateFields)
    .values({
      templateId,
      sectionId,
      key,
      label,
      fieldType,
      required,
      orderIndex: nextOrder,
    })
    .returning();

  return field;
}

/* =========================================================
   UPDATE FIELD
========================================================= */

export async function updateField(
  fieldId: string,
  updates: Partial<{
    label: string;
    required: boolean;
  }>,
) {
  await requireOrgUser();

  await database
    .update(listingTemplateFields)
    .set(updates)
    .where(eq(listingTemplateFields.id, fieldId));

  return { success: true };
}

/* =========================================================
   DELETE FIELD
========================================================= */

export async function deleteField(fieldId: string) {
  await requireOrgUser();

  await database
    .delete(listingTemplateFields)
    .where(eq(listingTemplateFields.id, fieldId));

  return { success: true };
}

async function ensureTemplateEditable(templateId: string) {
  const template = await database
    .select()
    .from(listingTemplates)
    .where(eq(listingTemplates.id, templateId));

  if (!template.length) {
    throw new Error("Template not found");
  }

  if (template[0].isLocked) {
    throw new Error("Template is locked and cannot be modified");
  }
}

export async function toggleTemplateLock(templateId: string) {
  await requireOrgUser();

  const template = await database
    .select()
    .from(listingTemplates)
    .where(eq(listingTemplates.id, templateId));

  if (!template.length) throw new Error("Template not found");

  const newState = !template[0].isLocked;

  await database
    .update(listingTemplates)
    .set({ isLocked: newState })
    .where(eq(listingTemplates.id, templateId));

  return { isLocked: newState };
}

export async function reorderSections(
  templateId: string,
  orderedIds: string[],
) {
  await ensureTemplateEditable(templateId);

  for (let i = 0; i < orderedIds.length; i++) {
    await database
      .update(listingTemplateSections)
      .set({ orderIndex: i + 1 })
      .where(eq(listingTemplateSections.id, orderedIds[i]));
  }

  return { success: true };
}

export async function reorderFields(
  sectionId: string,
  orderedFieldIds: string[],
) {
  await requireOrgUser();

  const section = await database
    .select()
    .from(listingTemplateSections)
    .where(eq(listingTemplateSections.id, sectionId));

  if (!section.length) throw new Error("Section not found");

  const templateId = section[0].templateId;

  await ensureTemplateEditable(templateId);

  for (let i = 0; i < orderedFieldIds.length; i++) {
    await database
      .update(listingTemplateFields)
      .set({ orderIndex: i + 1 })
      .where(eq(listingTemplateFields.id, orderedFieldIds[i]));
  }

  return { success: true };
}

async function bumpTemplateVersion(templateId: string) {
  await database
    .update(listingTemplates)
    .set({
      version: sql`${listingTemplates.version} + 1`,
    })
    .where(eq(listingTemplates.id, templateId));
}

export async function cloneTemplate(templateId: string) {
  const user = await requireOrgUser();

  const original = await database.query.listingTemplates.findFirst({
    where: eq(listingTemplates.id, templateId),
    with: {
      sections: {
        with: { fields: true },
      },
    },
  });

  if (!original) throw new Error("Template not found");

  const [newTemplate] = await database
    .insert(listingTemplates)
    .values({
      organisationId: user.organisationId,
      name: `${original.name} (Clone)`,
      description: original.description,
      createdByUserId: user.userId,
      version: 1,
      isLocked: false,
    })
    .returning();

  for (const section of original.sections) {
    const [newSection] = await database
      .insert(listingTemplateSections)
      .values({
        templateId: newTemplate.id,
        title: section.title,
        orderIndex: section.orderIndex,
      })
      .returning();

    for (const field of section.fields) {
      await database.insert(listingTemplateFields).values({
        templateId: newTemplate.id,
        sectionId: newSection.id,
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        required: field.required,
        orderIndex: field.orderIndex,
        optionsJson: field.optionsJson,
      });
    }
  }

  return newTemplate;
}
