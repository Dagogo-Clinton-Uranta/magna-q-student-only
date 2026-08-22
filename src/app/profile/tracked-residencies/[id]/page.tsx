import {
  ResidencyDetailScreen,
  type ResidencyDetailScreenProps,
} from "@/components/resources/residency-detail-screen";

export default function TrackedResidencyDetailPage(
  props: ResidencyDetailScreenProps,
) {
  return <ResidencyDetailScreen {...props} context="tracked" />;
}
