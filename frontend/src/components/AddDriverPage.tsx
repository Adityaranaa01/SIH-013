import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner@2.0.3'
import { DriversAPI } from '../lib/api'

export function AddDriverPage() {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // any prefetch or effects can go here later
  }, [])

  const handleSubmit = async () => {
    const trimmedId = id.trim()
    const trimmedName = name.trim()
    if (!trimmedId || !trimmedName) {
      toast.error('Driver ID and Name are required')
      return
    }
    setSubmitting(true)
    try {
  await DriversAPI.create({ id: trimmedId, name: trimmedName, phone: phone.trim() || undefined })
      toast.success('Driver created')
      setId('')
      setName('')
      setPhone('')
  // no license now
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create driver')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">Add Driver</h2>
        <p className="text-lg text-muted-foreground">Create a new driver record</p>
      </div>

      <Card className="card-elevated border-0 max-w-xl">
        <CardHeader>
          <CardTitle className="text-gradient-primary">Driver Details</CardTitle>
          <CardDescription>Provide the basic information for the driver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Driver ID</label>
              <Input value={id} onChange={e => setId(e.target.value)} placeholder="Driver Id : D001" />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone : +91 12345 67890" />
            </div>
            <div className="pt-2">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Driver'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
