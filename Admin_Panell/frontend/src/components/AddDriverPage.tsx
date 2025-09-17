import { useState } from 'react';
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { DriversAPI } from '../lib/api';

export function AddDriverPage() {
  const [driverId, setDriverId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const id = driverId.trim();
    const name = driverName.trim();

    if (!id || !name) {
      toast.error('Driver ID and Name are required');
      return;
    }

    setSubmitting(true);
    try {
      await DriversAPI.create({
        id,
        name,
        phone: phone.trim() || undefined,
      });
      toast.success('Driver created successfully');
      setDriverId('');
      setDriverName('');
      setPhone('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gradient-primary">
          Add Driver
        </h2>
        <p className="text-lg text-muted-foreground">
          Create a new driver record
        </p>
      </header>

      <Card className="card-elevated border-0 max-w-xl">
        <CardHeader>
          <CardTitle className="text-gradient-primary">Driver Details</CardTitle>
          <CardDescription>
            Provide the basic information for the driver
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Driver ID</label>
              <Input
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                placeholder="e.g. D001"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 12345 67890"
              />
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
  );
}
