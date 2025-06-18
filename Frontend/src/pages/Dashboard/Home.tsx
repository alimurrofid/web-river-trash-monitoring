/* eslint-disable @typescript-eslint/no-unused-vars */

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";
import TrafficStats from "../../components/common/TrafficStats";

const Dashboard: React.FC = () => {

  return (
    <>
      <PageMeta
        title="Rivermonitor | Dashboard"
        description="Dashboard analitik untuk penghitungan kendaraan"
      />
      <PageBreadcrumb pageTitle="Dashboard Analitik" />

      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <FourIsToThree />
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard>
            <TrafficStats />
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default Dashboard;