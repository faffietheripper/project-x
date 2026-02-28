function TemplatePreview({ template }: any) {
  return (
    <div>
      {template.sections.map((section: any) => (
        <div key={section.id} className="mb-8">
          <h3 className="mb-4 text-sm uppercase text-gray-500">
            {section.title}
          </h3>

          {section.fields.map((field: any) => (
            <div key={field.id} className="mb-4">
              <label className="block text-sm mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.fieldType === "text" && (
                <input className="w-full p-3 bg-gray-800 border border-gray-700 rounded" />
              )}

              {field.fieldType === "number" && (
                <input
                  type="number"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
                />
              )}

              {field.fieldType === "boolean" && <input type="checkbox" />}

              {field.fieldType === "file" && <input type="file" />}

              {field.fieldType === "dropdown" && (
                <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded">
                  <option>Select...</option>
                </select>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
