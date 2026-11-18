import SpecificationSetupClientPage from "@/src/app/specification-setup/specification-setup-client-page";
import SpecificationTreeClientPage from "@/src/app/specification-setup/specification-tree-client-page";
import Pagelayout from "@/src/components/layout/page-layout";

export default function SpecificationTree() {
  return (
    <Pagelayout>
      <SpecificationTreeClientPage/>
    </Pagelayout>
  );
}