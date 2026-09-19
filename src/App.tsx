import { useState } from "react";
import type { Screen, Business, Professional, PreSelected, HomeSnapshot } from "@/types";
import {
  HomeScreen,
  DetailScreen,
  FilteredProScreen,
  ConfirmScreen,
  ConfirmedScreen,
} from "@/screens";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [preSelected, setPreSelected] = useState<PreSelected | null>(null);
  const [homeSnapshot, setHomeSnapshot] = useState<HomeSnapshot | undefined>(undefined);

  const handleSelectBusiness = (b: Business, pre: PreSelected | null, snapshot: HomeSnapshot) => {
    setSelectedBusiness(b);
    setPreSelected(pre);
    setHomeSnapshot(snapshot);
    setScreen(pre ? "select-pro" : "detail");
  };

  const handleBook = (pro: Professional, slot: string, date: string) => {
    setSelectedPro(pro);
    setSelectedSlot(slot);
    setSelectedDate(date);
    setScreen("confirm");
  };

  const handleConfirm = () => setScreen("confirmed");

  const handleHome = () => {
    setScreen("home");
    setSelectedBusiness(null);
    setSelectedPro(null);
    setSelectedSlot("");
    setSelectedDate("");
    setPreSelected(null);
  };

  if (screen === "home") {
    return (
      <HomeScreen
        onSelectBusiness={handleSelectBusiness}
        initialSnapshot={homeSnapshot}
      />
    );
  }

  if (screen === "detail" && selectedBusiness) {
    return (
      <DetailScreen
        business={selectedBusiness}
        onBook={handleBook}
        onBack={handleHome}
      />
    );
  }

  if (screen === "select-pro" && selectedBusiness && preSelected) {
    return (
      <FilteredProScreen
        business={selectedBusiness}
        preSelected={preSelected}
        onBook={handleBook}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "confirm" && selectedBusiness && selectedPro) {
    return (
      <ConfirmScreen
        business={selectedBusiness}
        professional={selectedPro}
        slot={selectedSlot}
        date={selectedDate}
        onConfirm={handleConfirm}
        onBack={() => setScreen(preSelected ? "select-pro" : "detail")}
      />
    );
  }

  if (screen === "confirmed" && selectedBusiness && selectedPro) {
    return (
      <ConfirmedScreen
        business={selectedBusiness}
        professional={selectedPro}
        slot={selectedSlot}
        date={selectedDate}
        onHome={handleHome}
      />
    );
  }

  return null;
}
