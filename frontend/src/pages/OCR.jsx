import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MdUpload, MdDocumentScanner, MdSave, MdClose } from 'react-icons/md'

export default function OCR() {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleFile = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setResult(null)
        setSaved(false)
    }

    const extract = async () => {
        if (!file) { toast.error('Please select an image first'); return }
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const r = await api.post('/ocr/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setResult(r.data)
            toast.success('Text extracted successfully!')
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'OCR extraction failed')
        }
        setLoading(false)
    }

    const saveMedicine = async () => {
        if (!result) return
        try {
            await api.post('/medicines/', {
                name: result.medicine_name || 'Unknown Medicine',
                dosage: result.dosage || 'As prescribed',
                quantity: parseFloat(result.quantity) || 30,
                frequency: 'once daily',
                start_date: new Date().toISOString().split('T')[0],
                instructions: result.instructions,
            })
            toast.success('Medicine saved from prescription!')
            setSaved(true)
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to save')
        }
    }

    return (
        <div className="space-y-6 fade-in max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">OCR – Prescription Scanner</h1>
                <p className="text-slate-500 text-sm mt-1">Upload a prescription image to extract medicine details automatically</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload */}
                <div className="card">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Upload Prescription</h2>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-primary-400 transition-colors group">
                        {preview ? (
                            <img src={preview} alt="preview" className="max-h-64 object-contain rounded-xl" />
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                    <MdUpload size={32} className="text-primary-500" />
                                </div>
                                <p className="font-medium text-slate-700 dark:text-slate-300">Click to upload or drag & drop</p>
                                <p className="text-sm text-slate-400 mt-1">PNG, JPG, JPEG · Max 10MB</p>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </label>

                    <div className="flex gap-3 mt-4">
                        {preview && (
                            <button onClick={() => { setFile(null); setPreview(null); setResult(null) }} className="btn-secondary flex-1 justify-center">
                                <MdClose size={16} /> Clear
                            </button>
                        )}
                        <button onClick={extract} disabled={!file || loading} className="btn-primary flex-1 justify-center">
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><MdDocumentScanner size={18} /> Extract Text</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="card">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Extracted Information</h2>
                    {!result ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <MdDocumentScanner size={48} className="mb-3 opacity-30" />
                            <p className="text-sm">Extracted data will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { label: 'Medicine Name', value: result.medicine_name, icon: '💊' },
                                { label: 'Dosage', value: result.dosage, icon: '⚖️' },
                                { label: 'Quantity', value: result.quantity, icon: '🔢' },
                                { label: 'Instructions', value: result.instructions, icon: '📝' },
                            ].map(({ label, value, icon }) => (
                                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-200">
                                    <div className="text-xs text-slate-400 mb-1">{icon} {label}</div>
                                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                                        {value || <span className="text-slate-400 italic">Not detected</span>}
                                    </div>
                                </div>
                            ))}

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-200">
                                <div className="text-xs text-slate-400 mb-1">📄 Raw Text</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                    {result.raw_text}
                                </div>
                            </div>

                            <button onClick={saveMedicine} disabled={saved} className={`btn-primary w-full justify-center ${saved ? 'opacity-60' : ''}`}>
                                <MdSave size={18} />{saved ? 'Saved!' : 'Save to Medicines'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="card bg-blue-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <h3 className="font-semibold text-primary-800 dark:text-primary-300 mb-2">Supported OCR Engines</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                    {['EasyOCR (Primary)', 'Tesseract OCR (Fallback)', 'spaCy NLP (Parsing)'].map(e => (
                        <div key={e} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-primary-500" />
                            {e}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
