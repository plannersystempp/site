import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit, Star, Package } from 'lucide-react';
import { useEnhancedData, type Supplier } from '@/contexts/EnhancedDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierItemsManager } from './SupplierItemsManager';

interface SupplierCardProps {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, onEdit }) => {
  const { supplierItems } = useEnhancedData();
  const { user } = useAuth();
  const [showItems, setShowItems] = useState(false);

  const isAdmin = user?.role === 'admin';
  const items = supplierItems.filter(item => item.supplier_id === supplier.id);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({supplier.total_ratings})
        </span>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">{supplier.name}</CardTitle>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          {renderStars(supplier.average_rating)}
        </CardHeader>

        <CardContent className="flex-1 space-y-3 text-sm">
          {supplier.contact_person && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Contato:</span>
              <span className="truncate">{supplier.contact_person}</span>
            </div>
          )}

          {supplier.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{supplier.phone}</span>
            </div>
          )}

          {supplier.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowItems(true)}
              className="w-full"
            >
              <Package className="h-3 w-3 mr-2" />
              Ver Itens ({items.length})
            </Button>
          </div>

          {supplier.notes && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p className="line-clamp-2">{supplier.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showItems && (
        <SupplierItemsManager
          supplier={supplier}
          onClose={() => setShowItems(false)}
        />
      )}
    </>
  );
};
