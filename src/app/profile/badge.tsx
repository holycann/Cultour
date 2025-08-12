import DetailHeader from "@/app/_components/DetailHeader";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useBadge } from "@/hooks/useBadge";
import { Badge } from "@/types/Badge";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BadgeSection } from "./_components/BadgeSection";

export default function BadgeScreen() {
  const { user } = useAuth();
  const { badges, userBadges, isLoading, error, fetchBadges, fetchUserBadges } =
    useBadge();

  useEffect(() => {
    fetchBadges();
    if (user) {
      fetchUserBadges({ pagination: { per_page: 100 } });
    }
  }, [user]);

  if (isLoading || error) {
    return (
      <LoadingScreen
        message={error ? `Error: ${error}` : "Loading badges..."}
        backgroundColor={error ? "red" : "#F9EFE4"}
      />
    );
  }

  // Separate my badges and available badges
  const myBadges: Badge[] = badges.filter((badge) =>
    userBadges.some((userBadge) => userBadge.badge_id === badge.id)
  );
  const availableBadges: Badge[] = badges.filter(
    (badge) => !userBadges.some((userBadge) => userBadge.badge_id === badge.id)
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Custom Header */}
      <DetailHeader title="Badges" />

      <BadgeSection
        title="My Badges"
        badges={myBadges}
        emptyMessage="No badges earned yet"
        variant="earned"
      />

      <BadgeSection
        title="Available Badges"
        badges={availableBadges}
        emptyMessage="No additional badges available"
        variant="available"
      />
    </SafeAreaView>
  );
}
