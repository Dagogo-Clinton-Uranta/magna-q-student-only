import {
  ResidencyEventDetailScreen,
  type ResidencyEventDetailScreenProps,
} from "@/components/resources/residency-event-detail-screen";

export default function TrackedOpportunityDetailPage(
  props: ResidencyEventDetailScreenProps,
) {
  return <ResidencyEventDetailScreen {...props} context="tracked" />;
}
