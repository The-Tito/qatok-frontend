import type { Metadata } from 'next';
import Link from 'next/link';
import { SimulationDataForm } from '../simulation-data-form';

export const metadata: Metadata = { title: 'Nueva simulación · Admin' };

export default function NewSimulationPage() {
  return (
    <div className="admin-page">
      <Link href="/admin/simulations" className="admin-back">
        ◀ Simulaciones
      </Link>
      <div className="admin-head-text">
        <h1 className="admin-title">Nueva simulación</h1>
        <span className="admin-sub">
          Se crea como borrador. Después agregas los pasos y la publicas.
        </span>
      </div>
      <div className="admin-narrow">
        <SimulationDataForm />
      </div>
    </div>
  );
}
