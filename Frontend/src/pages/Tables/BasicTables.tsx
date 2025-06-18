import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Laporan from "./component/Laporan";
// import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="Rivermonitor | Laporan"
        description="Rivermonitor Laporan"
      />
      <PageBreadcrumb pageTitle="Laporan" />
      <div className="space-y-6">
        
        <div className="col-span-12 xl:col-span-12">
          <Laporan />
        </div>
      </div>
    </>
  );
}
