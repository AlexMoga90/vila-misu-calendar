
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

  const getReservationKey = (room, date) => `${room}-${format(date, "yyyy-MM-dd")}`;

  const handleAddReservation = () => {
    if (!selectedDate || !activeRoom || !guestName || stayLength < 1) return;

    const newReservations = { ...reservations };

    for (let i = 0; i < stayLength; i++) {
      const date = addDays(selectedDate, i);
      const key = getReservationKey(activeRoom.name, date);
      if (newReservations[key]) continue; // evită duplicate
      newReservations[key] = {
        name: guestName,
        length: stayLength,
        room: activeRoom.name,
        date,
      };
    }

    setReservations(newReservations);
    resetDialog();
  };

  const resetDialog = () => {
    setSelectedDate(null);
    setActiveRoom(null);
    setGuestName("");
    setStayLength(1);
  };

  const cancelReservation = (roomName, date) => {
    const key = getReservationKey(roomName, date);
    const updated = { ...reservations };
    delete updated[key];
    setReservations(updated);
  };

  const filteredReservations = Object.values(reservations).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "1rem", maxWidth: 1000, margin: "auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Calendar Rezervări - Vila Misu
      </h1>
      <input
        type="text"
        placeholder="Caută după nume..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", marginBottom: "1rem", width: "100%" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
        {days.map((day) => (
          <div
            key={day}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              backgroundColor: "#fff",
              minHeight: 100,
            }}
            onClick={() => setSelectedDate(day)}
          >
            <div style={{ fontWeight: "bold" }}>{format(day, "dd MMM")}</div>
            {rooms.map((room) => {
              const key = getReservationKey(room.name, day);
              const res = reservations[key];
              if (!res) return null;
              return (
                <div key={key} style={{ fontSize: "0.75rem", backgroundColor: "#fdd", marginTop: 2, padding: 2 }}>
                  {room.name}: {res.name}
                  <button
                    style={{ marginLeft: 5, fontSize: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelReservation(room.name, day);
                    }}
                  >
                    ✖
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ backgroundColor: "#fff", padding: 20, borderRadius: 8, width: 400 }}>
            <h2>Rezervare pentru {format(selectedDate, "dd MMM yyyy")}</h2>
            <div style={{ marginBottom: 10 }}>
              <select
                value={activeRoom?.name || ""}
                onChange={(e) => {
                  const selected = rooms.find((r) => r.name === e.target.value);
                  setActiveRoom(selected);
                }}
                style={{ width: "100%", padding: 6 }}
              >
                <option value="">Alege camera</option>
                {rooms.map((room) => (
                  <option key={room.name} value={room.name}>
                    {room.name} ({room.capacity} pers)
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nume cazat"
              style={{ width: "100%", marginBottom: 8, padding: 6 }}
            />
            <input
              type="number"
              min={1}
              value={stayLength}
              onChange={(e) => setStayLength(parseInt(e.target.value))}
              placeholder="Zile"
              style={{ width: "100%", marginBottom: 8, padding: 6 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={handleAddReservation}>Salvează</button>
              <button onClick={resetDialog}>Închide</button>
            </div>
          </div>
        </div>
      )}

      {search && (
        <div style={{ marginTop: 20 }}>
          <h3>Rezultate căutare:</h3>
          {filteredReservations.map((res, i) => (
            <div key={i} style={{ fontSize: "0.9rem" }}>
              {res.name} – {res.room} ({format(res.date, "dd MMM yyyy")})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
