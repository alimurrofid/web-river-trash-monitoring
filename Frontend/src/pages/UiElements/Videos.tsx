import { useLocation, useNavigate } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import GenerateLink from "../../components/common/GenerateLink";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TrafficStats from "../../components/common/TrafficStats";
import ValidLink from "../../components/common/ValidLink";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";
import React from "react";
// Define interfaces for component props
interface LocationState {
  billboard_name?: string;
}

export default function Videos(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the billboard_name from the location state
  const state = location.state as LocationState;
  const billboardName = state?.billboard_name || 'Unknown';
  
  // If no billboard name is provided, redirect back to the billboard selection page
  React.useEffect(() => {
    if (!state?.billboard_name) {
      navigate('/billboards');
    }
  }, [state, navigate]);

  return (
    <>
      <PageMeta title={`AIDA | Billboard ${billboardName}`} description={`AIDA Billboard ${billboardName}`} />
      <PageBreadcrumb pageTitle={`Billboard ${billboardName}`} />
      
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/billboards')}
          className="mr-4 p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Billboard {billboardName} Details
        </h2>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <FourIsToThree />
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title={`Perhitungan kendaraan - Billboard ${billboardName}`}>
            <TrafficStats billboardName={billboardName as string} />
          </ComponentCard>
          <ComponentCard title="Generate Link">
            <GenerateLink billboardName={billboardName as string} />
          </ComponentCard>
          <ComponentCard title="">
            <ValidLink billboardName={billboardName as string} />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}