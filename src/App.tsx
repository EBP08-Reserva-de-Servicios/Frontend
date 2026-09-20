import { useState } from "react";
import type { Screen, Business, Professional, PreSelected, HomeSnapshot } from "@/types";
import {
  HomeScreen,
  DetailScreen,
  FilteredProScreen,
  ConfirmScreen,
  ConfirmedScreen,
} from "@/screens";
import { crearReserva, ReservaError } from "@/services/api";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [preSelected, setPreSelected] = useState<PreSelected | null>(null);
  const [homeSnapshot, setHomeSnapshot] = useState<HomeSnapshot | undefined>(undefined);
  const [codigoReserva, setCodigoReserva] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");

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
    setErrorReserva("");
    setScreen("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedBusiness || enviando) return;
    setEnviando(true);
    setErrorReserva("");
    try {
      // selectedBusiness.id es el id del ServicioProveedor (ver adaptador)
      const reserva = await crearReserva(selectedBusiness.id, selectedDate, selectedSlot);
      setCodigoReserva(reserva.codigo);
      setScreen("confirmed");
    } catch (e) {
      setErrorReserva(
        e instanceof ReservaError && e.status === 409
          ? e.message
          : "No se pudo completar la reserva. Intenta de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleHome = () => {
    setScreen("home");
    setSelectedBusiness(null);
    setSelectedPro(null);
    setSelectedSlot("");
    setSelectedDate("");
    setPreSelected(null);
    setCodigoReserva("");
    setErrorReserva("");
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
        enviando={enviando}
        error={errorReserva}
        onConfirm={handleConfirm}
        onBack={() => {
          setErrorReserva("");
          setScreen(preSelected ? "select-pro" : "detail");
        }}
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
        codigo={codigoReserva}
        onHome={handleHome}
      />
    );
  }

  return null;
}
