export function Dialog({ open, children }) {
  return open ? children : null;
}