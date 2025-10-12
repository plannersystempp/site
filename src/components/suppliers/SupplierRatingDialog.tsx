import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEnhancedData, type Supplier } from '@/contexts/EnhancedDataContext';
import { Star } from 'lucide-react';

interface SupplierRatingDialogProps {
  supplier: Supplier;
  eventId: string;
  onClose: () => void;
}

export const SupplierRatingDialog: React.FC<SupplierRatingDialogProps> = ({
  supplier,
  eventId,
  onClose
}) => {
  const { addSupplierRating } = useEnhancedData();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      await addSupplierRating({
        supplier_id: supplier.id,
        event_id: eventId,
        rating,
        notes: notes || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error rating supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Fornecedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Como foi a experiência com <strong>{supplier.name}</strong>?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm mt-2 text-muted-foreground">
                {rating === 5 && 'Excelente!'}
                {rating === 4 && 'Muito Bom'}
                {rating === 3 && 'Bom'}
                {rating === 2 && 'Regular'}
                {rating === 1 && 'Ruim'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Comentários (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Deixe um comentário sobre este fornecedor..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={rating === 0 || loading}>
              {loading ? 'Salvando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
