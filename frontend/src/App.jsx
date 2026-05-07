import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/auth/Login';
import { PublicVisitRequest } from './pages/public/PublicVisitRequest';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { ManagerDashboard } from './pages/dashboard/ManagerDashboard';
import { OfficerDashboard } from './pages/dashboard/OfficerDashboard';
import { PrisonsList } from './pages/prisons/PrisonsList';
import { PrisonDetail } from './pages/prisons/PrisonDetail';
import { PrisonForm } from './pages/prisons/PrisonForm';
import { InmatesList } from './pages/inmates/InmatesList';
import { InmateDetail } from './pages/inmates/InmateDetail';
import { InmateForm } from './pages/inmates/InmateForm';
import { InmateAssignForm } from './pages/inmates/InmateAssignForm';
import { OfficersList } from './pages/officers/OfficersList';
import { OfficerForm } from './pages/officers/OfficerForm';
import { TransfersList } from './pages/transfers/TransfersList';
import { TransferForm } from './pages/transfers/TransferForm';
import { VisitsList } from './pages/visits/VisitsList';
import { VisitSlots } from './pages/visits/VisitSlots';
import { IncidentsList } from './pages/incidents/IncidentsList';
import { IncidentDetail } from './pages/incidents/IncidentDetail';
import { IncidentForm } from './pages/incidents/IncidentForm';
import { DisciplinaryList } from './pages/disciplinary/DisciplinaryList';
import { DisciplinaryForm } from './pages/disciplinary/DisciplinaryForm';
import { HealthcareOverview } from './pages/healthcare/HealthcareOverview';
import { MedicalVisitForm } from './pages/healthcare/MedicalVisitForm';
import { DoctorForm } from './pages/healthcare/DoctorForm';
import { ShiftsList } from './pages/shifts/ShiftsList';
import { MLPredictions } from './pages/ml/MLPredictions';
import { MyPrison } from './pages/prisons/MyPrison';
import { ToastProvider } from './context/ToastContext';

const DashboardRedirect = () => {
  const role = localStorage.getItem('userRole');
  if (!role) return <Navigate to="/login" replace />;
  if (role === 'prison_manager') return <Navigate to="/dashboard/manager" replace />;
  if (role === 'officer') return <Navigate to="/dashboard/officer" replace />;
  return <Navigate to="/dashboard/superadmin" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/visit-request" element={<PublicVisitRequest />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="dashboard/superadmin" element={<SuperAdminDashboard />} />
            <Route path="dashboard/manager" element={<ManagerDashboard />} />
            <Route path="dashboard/officer" element={<OfficerDashboard />} />
            
             <Route path="prisons" element={<PrisonsList />} />
             <Route path="prisons/my" element={<MyPrison />} />
             <Route path="prisons/add" element={<PrisonForm />} />
             <Route path="prisons/:id" element={<PrisonDetail />} />
            <Route path="prisons/:id/edit" element={<PrisonForm />} />
            <Route path="inmates" element={<InmatesList />} />
            <Route path="inmates/add" element={<InmateForm />} />
            <Route path="inmates/:id" element={<InmateDetail />} />
            <Route path="inmates/:id/assign" element={<InmateAssignForm />} />
            <Route path="officers" element={<OfficersList />} />
            <Route path="officers/add" element={<OfficerForm />} />
            <Route path="transfers" element={<TransfersList />} />
            <Route path="transfers/add" element={<TransferForm />} />
            <Route path="visits" element={<VisitsList />} />
            <Route path="visits/slots" element={<VisitSlots />} />
             <Route path="incidents" element={<IncidentsList />} />
             <Route path="incidents/add" element={<IncidentForm />} />
             <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="disciplinary" element={<DisciplinaryList />} />
            <Route path="disciplinary/add" element={<DisciplinaryForm />} />
            <Route path="healthcare" element={<HealthcareOverview />} />
            <Route path="healthcare/visits/add" element={<MedicalVisitForm />} />
            <Route path="healthcare/doctors/add" element={<DoctorForm />} />
            <Route path="shifts" element={<ShiftsList />} />
            <Route path="ml" element={<MLPredictions />} />

          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>

  );
}

export default App;
