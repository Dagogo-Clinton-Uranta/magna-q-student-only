import {
  ResidencyEventDetailScreen,
  type ResidencyEventDetailScreenProps,
} from "@/components/resources/residency-event-detail-screen";

export default function ResidencyEventDetailPage(
  props: ResidencyEventDetailScreenProps,
) {
  return <ResidencyEventDetailScreen {...props} context="directory" />;
}
