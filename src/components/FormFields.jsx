import { Field, Toggle } from './ui'
import { IconPicker, ImagePicker, StringListEditor } from './inputs'

/**
 * Renders form controls from a field config.
 * types: text, email, url, number, password, textarea, select, toggle, icon, image, list
 * `options` maps a field key → [{ value, label }] for selects loaded at runtime.
 */
export default function FormFields({ fields, values, errors = {}, onChange, options = {}, isEdit }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields
        .filter((f) => !f.showIf || f.showIf(values))
        .map((f) => {
          const value = values[f.key]
          const set = (v) => onChange(f.key, v)
          const required = f.required === 'create' ? !isEdit : f.required
          const wide = f.wide || ['textarea', 'list', 'image'].includes(f.type)
          return (
            <Field
              key={f.key}
              label={f.type === 'toggle' ? null : f.label}
              hint={f.hint}
              error={errors[f.key]}
              required={required}
              className={wide ? 'sm:col-span-2' : ''}
            >
              {(id) => {
                const cls = `input ${errors[f.key] ? 'input-error' : ''}`
                switch (f.type) {
                  case 'textarea':
                    return (
                      <textarea
                        id={id}
                        className={cls}
                        rows={f.rows || 4}
                        value={value ?? ''}
                        placeholder={f.placeholder}
                        onChange={(e) => set(e.target.value)}
                      />
                    )
                  case 'select':
                    return (
                      <select id={id} className={cls} value={value ?? ''} onChange={(e) => set(e.target.value)}>
                        <option value="">{f.placeholder || '— None —'}</option>
                        {(f.options || options[f.key] || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )
                  case 'toggle':
                    return <Toggle id={id} checked={value} onChange={set} label={f.label} />
                  case 'icon':
                    return <IconPicker value={value} onChange={set} />
                  case 'image':
                    return <ImagePicker value={value} onChange={set} previewUrl={values[f.previewKey]} />
                  case 'list':
                    return <StringListEditor value={value} onChange={set} placeholder={f.placeholder} addLabel={f.addLabel} />
                  default:
                    return (
                      <input
                        id={id}
                        className={cls}
                        type={f.type || 'text'}
                        value={value ?? ''}
                        placeholder={f.placeholder}
                        autoComplete={f.type === 'password' ? 'new-password' : 'off'}
                        onChange={(e) => set(e.target.value)}
                      />
                    )
                }
              }}
            </Field>
          )
        })}
    </div>
  )
}
