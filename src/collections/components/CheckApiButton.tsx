'use client'

import React, { useState } from 'react'
import { useFormFields, useForm, Button, toast } from '@payloadcms/ui'

export const CheckApiButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const apiKeyField = useFormFields(([fields, dispatch]) => fields.apiKey)
  const providerField = useFormFields(([fields, dispatch]) => fields.provider)
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
    
    try {
      const res = await fetch(`/api/settings/check-api?key=${encodeURIComponent(apiKey)}&provider=${encodeURIComponent(provider)}`)
      const data = await res.json()

      if (data.success) {
        toast.success('API Key hoạt động tốt!')
        const modelsStr = data.models.join(', ')
        setResult(`✅ Hoạt động. Các mô hình: ${modelsStr}`)
        
        // Update the supportedModels field on the form
        dispatchFields({
           type: 'UPDATE',
           path: 'supportedModels',
           value: modelsStr
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
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: result.startsWith('✅') ? '#e6f3e6' : '#fbeaea', border: result.startsWith('✅') ? '1px solid #c3e6c3' : '1px solid #f2c7c7', borderRadius: '4px', color: '#333', fontSize: '13px' }}>
          {result}
        </div>
      )}
    </div>
  )
}
