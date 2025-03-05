import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import RecentOrders from "../../components/ecommerce/RecentOrders";
// import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="AIDA | Laporan"
        description="AIDA Laporan"
      />
      <PageBreadcrumb pageTitle="Laporan" />
      <div className="space-y-6">
        {/* <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard> */}
        <div className="col-span-12 xl:col-span-12">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
