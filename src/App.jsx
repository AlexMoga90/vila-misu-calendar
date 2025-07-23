
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from "date-fns";

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

const generateMonthDays = () => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
};

export default function CalendarApp() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservations, setReservations] = useState({});
  const [search, setSearch] = useState("");
  const [activeRoom, setActiveRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [stayLength, setStayLength] = useState(1);

  const days = generateMonthDays();

  const getReservationKey = (room, date) => \`\${room}-\${format(date, "yyyy-MM-dd")}\`;

  const handleAddReservation = () => {
    if (!selectedDate || !activeRoom || !guestName || stayLength < 1) return;

    const newReservations = { ...reservations };

    for (let i = 0; i < stayLength; i++) {
      const date = addDays(selectedDate, i);
      const key = getReservationKey(activeRoom.name, date);
      if (newReservations[key]) continue; // prevenim suprascrierea

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

  const handleCancelReservation = (room, date) => {
    const key = getReservationKey(room, date);
    const updated = { ...reservations };
    delete updated[key];
    setReservations(updated);
  };

  const filteredReservations = Object.values(reservations).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calendar Rezervări – Vila Misu</h1>
      <input
        type="text"
        placeholder="Caută după nume..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-sm"
      />

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} className="border p-2 rounded h-28 overflow-auto bg-white">
            <p className="text-sm font-semibold cursor-pointer" onClick={() => setSelectedDate(day)}>
              {format(day, "dd MMM")}
            </p>
            {rooms.map((room) => {
              const key = getReservationKey(room.name, day);
              const res = reservations[key];
              if (!res) return null;
              return (
                <div key={key} className="text-xs mt-1 bg-red-200 p-1 rounded flex justify-between items-center">
                  <span>{room.name}: {res.name}</span>
                  <button
                    onClick={() => handleCancelReservation(room.name, day)}
                    className="ml-2 text-red-600 font-bold"
                    title="Anulează"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-md w-full">
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

            <div className="mb-2">
              <label className="block font-medium">Nume cazat:</label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nume client"
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium">Număr de zile:</label>
              <input
                type="number"
                min={1}
                max={30}
                value={stayLength}
                onChange={(e) => setStayLength(parseInt(e.target.value))}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleAddReservation}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Salvează
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="border px-4 py-2 rounded"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {search && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Rezultate căutare:</h3>
          {filteredReservations.map((res, idx) => (
            <p key={idx} className="text-sm">
              {res.name} – {res.room} ({format(res.date, "dd MMM yyyy")})
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
