"use client";

import type { User } from "@/lib/types";

export function UserPicker({
  users,
  user,
  onChange,
}: {
  users: User[];
  user: User;
  onChange: (user: User) => void;
}) {
  return (
    <label className="user-picker">
      <span>Browsing as</span>
      <select
        aria-label="Choose who is browsing"
        value={user.id}
        onChange={(event) => {
          const nextUser = users.find((item) => item.id === event.target.value);
          if (nextUser) onChange(nextUser);
        }}
      >
        {users.map((item) => (
          <option value={item.id} key={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
