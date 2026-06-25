'use client'

import React, { useState } from 'react'
import { useFormFields, useForm, Button, toast } from '@payloadcms/ui'

export const CheckApiButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [modelsList, setModelsList] = useState<string[]>([])
  
  const apiKeyField = useFormFields(([fields, dispatch]) => fields.apiKey)
  const providerField = useFormFields(([fields, dispatch]) => fields.provider)
  const preferredModelField = useFormFields(([fields, dispatch]) => fields.preferredModel)
  const { dispatchFields } = useForm()

  const handleCheck = async () => {
    const apiKey = apiKeyField?.value as string
    const provider = providerField?.value as string

    if (!apiKey || !provider) {
       toast.error('Vui lòng nhập API Key và chọn Nhà cung cấp trước khi kiểm tra.')
       return
    }

    setLoading(true)
    setResult(null)
    setModelsList([])
    
    try {
      const res = await fetch(`/api/settings/check-api?key=${encodeURIComponent(apiKey)}&provider=${encodeURIComponent(provider)}`)
      const data = await res.json()

      if (data.success) {
        toast.success('API Key hoạt động tốt!')
        setModelsList(data.models)
        setResult(`✅ Hoạt động tốt.`)
        
        // Update the supportedModels field on the form
        dispatchFields({
           type: 'UPDATE',
           path: 'supportedModels',
           value: data.models.join(', ')
        })
      } else {
        toast.error(data.error || 'API Key không hợp lệ')
        setResult(`❌ Lỗi: ${data.error}`)
      }
    } catch (e: any) {
      toast.error('Lỗi kết nối đến máy chủ')
      setResult(`❌ Lỗi hệ thống`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '20px', marginTop: '20px' }}>
      <Button onClick={handleCheck} disabled={loading} size="small">
        {loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối & Mô hình'}
      </Button>
      {result && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: 'var(--theme-elevation-50, rgba(128,128,128,0.1))', 
          border: result.startsWith('✅') ? '1px solid var(--theme-success-500, #28a745)' : '1px solid var(--theme-error-500, #dc3545)', 
          borderRadius: '4px', 
          color: 'var(--theme-text, inherit)', 
          fontSize: '13px' 
        }}>
          <div style={{ marginBottom: modelsList.length > 0 ? '10px' : '0' }}>{result}</div>
          
          {modelsList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: 'bold' }}>Chọn mô hình muốn gán cho Key này:</label>
              <select 
                value={(preferredModelField?.value as string) || ''}
                onChange={(e) => {
                  dispatchFields({
                    type: 'UPDATE',
                    path: 'preferredModel',
                    value: e.target.value
                  })
                }}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--theme-elevation-200, #ccc)', 
                  backgroundColor: 'var(--theme-bg, #222)', 
                  color: 'var(--theme-text, #fff)', 
                  maxWidth: '400px', 
                  cursor: 'pointer' 
                }}
              >
                <option value="">-- Mặc định (Sử dụng cấu hình Global) --</option>
                {modelsList.map(m => (
                  <option key={m} value={m} style={{ backgroundColor: 'var(--theme-bg, #222)', color: 'var(--theme-text, #fff)' }}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
