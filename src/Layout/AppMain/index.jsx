import { Fragment, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { ToastContainer } from 'react-toastify';
import SuspenseFallback from './SuspenseFallback';

const DashboardPage = lazy(() => import('../../pages/Dashboard'));
const DpsRunsPage = lazy(() => import('../../pages/DpsRuns'));
const UploadPage = lazy(() => import('../../pages/Upload'));
const AnalyticsPage = lazy(() => import('../../pages/Analytics'));
const CharactersPage = lazy(() => import('../../pages/Characters'));
const SettingsPage = lazy(() => import('../../pages/Settings'));

const lazyRoute = (Component) => (
  <Suspense fallback={<SuspenseFallback type="ball-pulse" />}>
    <Component />
  </Suspense>
);

const AppMain = () => (
  <Fragment>
    <Routes>
      <Route path="/dashboard" element={lazyRoute(DashboardPage)} />
      <Route path="/runs" element={lazyRoute(DpsRunsPage)} />
      <Route path="/upload" element={lazyRoute(UploadPage)} />
      <Route path="/analytics" element={lazyRoute(AnalyticsPage)} />
      <Route path="/characters" element={lazyRoute(CharactersPage)} />
      <Route path="/settings" element={lazyRoute(SettingsPage)} />
      <Route path="/" element={<Navigate to="/runs" replace />} />
    </Routes>
    <ToastContainer />
  </Fragment>
);

export default AppMain;
