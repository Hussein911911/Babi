export type CarDTO = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  priceUSD: number;
  negotiable: boolean;
  mileage: number;
  transmission: string;
  fuel: string;
  bodyType: string;
  condition: string;
  colorName: string;
  colorHex: string;
  engine: string;
  cylinders: number;
  horsepower: number;
  torque: number;
  acceleration: number;
  drivetrain: string;
  seats: number;
  doors: number;
  fuelEconomy: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  safety: string;
  comfort: string;
  exterior: string;
  images: string;
  description: string;
  vin: string | null;
  inspection: string;
  warranty: string;
  featured: boolean;
  sold: boolean;
  views: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCarDTO(car: any): CarDTO {
  const { createdAt, updatedAt, ...rest } = car;
  return rest as CarDTO;
}
