import {
  ResidencyDetailScreen,
  type ResidencyDetailScreenProps,
} from "@/components/resources/residency-detail-screen";

export default function ResidencyDirectoryDetailPage(
  props: ResidencyDetailScreenProps,
) {
  return <ResidencyDetailScreen {...props} context="directory" />;
}
