export interface ShipmentUpdate {
  status: string;
  location: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  recipientName: string;
  destinationAddress: string;
  originCityState: string;
  fedExHub: string;
  assetValue: string;
  serviceFee: string;
  estimatedDeliveryDate: string;
  status: string;
  createdAt: string;
  history: ShipmentUpdate[];
}
