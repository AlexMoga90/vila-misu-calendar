import { useState } from "react";
import {
  format,
  eachDayOfInterval,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Dialog } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const rooms = [
  { name: "Camera 1", capacity: 2 },
  { name: "Camera 2", capacity: 2 },
  { name: "Camera 3", capacity: 2 },
  { name: "Camera 4", capacity: 2 },
  { name: "Camera 5", capacity: 3 },
  { name: "Camera 6", capacity: 3 },
  { name: "Camera 7", capacity: 2 },
  { name: "Apartament", capacity: 4 },
  { name: "Toată pensiunea", capacity: 20 },
];

const generateDaysForMonth = (year, month) => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
};

export default function CalendarApp() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservations, setReservations] = useState({});
  const [search, setSearch] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [stayLength, setStayLength] = useState(1);

  const days = generateDaysForMonth(currentYear, currentMonth);

  const getReservationKey = (room, date) => `${room}-${format(date, "yyyy-MM-dd")}`;

  const handleAddReservation = () => {
    if (!selectedDate || !activeRoom || !guestName || stayLength < 1) return;

    const newReservations = { ...reservations };
    for (let i = 0; i < stayLength; i++) {
      const date = addDays(selectedDate, i);
      const key = getReservationKey(activeRoom.name, date);
      if (newReservations[key]) continue;

      newReservations[key] = {
        name: guestName,
        length: stayLength,
        room: activeRoom.name,
        date,
      };
    }

    setReservations(newReservations);
    setSelectedDate(null);
    setActiveRoom(null);
    setGuestName("");
    setStayLength(1);
  };

  const handleDeleteReservation = (room, date) => {
    const key = getReservationKey(room, date);
    const updated = { ...reservations };
    delete updated[key];
    setReservations(updated);
  };

  const filteredReservations = Object.values(reservations).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calendar Rezervări - Vila Misu</h1>

      <div className="flex gap-2 items-center mb-4">
        <Button onClick={() => {
          if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
          } else {
            setCurrentMonth(currentMonth - 1);
          }
        }}>
          &larr; Luna anterioară
        </Button>
        <span className="font-medium">
          {format(new Date(currentYear, currentMonth), "MMMM yyyy")}
        </span>
        <Button onClick={() => {
          if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
          } else {
            setCurrentMonth(currentMonth + 1);
          }
        }}>
          Luna următoare &rarr;
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Caută după nume..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border rounded p-2 h-28 cursor-pointer hover:bg-gray-100 overflow-hidden"
            onClick={() => setSelectedDate(day)}
          >
            <p className="text-sm font-semibold">{format(day, "dd MMM")}</p>
            {rooms.map((room) => {
              const key = getReservationKey(room.name, day);
              const res = reservations[key];
              if (!res) return null;
              return (
                <div
                  key={key}
                  className="text-xs mt-1 bg-red-200 rounded px-1 truncate flex justify-between items-center"
                >
                  <span>
                    {room.name}: {res.name} ({res.length} zile)
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReservation(room.name, day);
                    }}
                    className="ml-2 text-xs text-red-700 hover:underline"
                  >
                    șterge
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate && (
        <Dialog open={true} onOpenChange={() => setSelectedDate(null)}>
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow max-w-lg w-full">
              <h2 className="text-lg font-semibold mb-4">
                Adaugă rezervare – {format(selectedDate, "dd MMM yyyy")}
              </h2>

              <div className="mb-2">
                <label className="font-medium">Selectează cameră:</label>
                <select
                  className="w-full border p-2 rounded mt-1"
                  value={activeRoom?.name || ""}
                  onChange={(e) => {
                    const selected = rooms.find((r) => r.name === e.target.value);
                    setActiveRoom(selected);
                  }}
                >
                  <option value="">Alege camera</option>
                  {rooms.map((room) => (
                    <option key={room.name} value={room.name}>
                      {room.name} ({room.capacity} pers)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nume cazat:</label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Introdu numele persoanei cazate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Număr de zile (ex: 3 = cazare 3 nopți):
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={stayLength}
                    onChange={(e) => setStayLength(parseInt(e.target.value))}
                    placeholder="Câte zile?"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <Button onClick={handleAddReservation}>Salvează rezervarea</Button>
                  <Button variant="outline" onClick={() => setSelectedDate(null)}>
                    Închide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {search && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Rezultate căutare:</h3>
          {filteredReservations.map((res, idx) => (
            <p key={idx} className="text-sm">
              {res.name} – {res.room} ({format(res.date, "dd MMM yyyy")}, {res.length} zile)
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
