import ComponentCard from "../../components/common/ComponentCard";
import GenerateLink from "../../components/common/GenerateLink";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TrafficStats from "../../components/common/TrafficStats";
import ValidLink from "../../components/common/ValidLink";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";

export default function Videos() {
  return (
    <>
      <PageMeta title="AIDA | Videos" description="AIDA Videos" />
      <PageBreadcrumb pageTitle="Videos" />
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <FourIsToThree />
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Perhitungan kendaraan">
            <TrafficStats />
          </ComponentCard>
          <ComponentCard title="Generate Link">
            <GenerateLink />
          </ComponentCard>
          <ComponentCard title="">
            <ValidLink />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
