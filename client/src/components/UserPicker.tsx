"use client";

import type { UserPickerProps } from "@/lib/types";
import { SelectDropdown } from "./SelectDropdown";

export function UserPicker({
  users,
  user,
  onChange,
}: UserPickerProps) {
  return (
    <label className="user-picker">
      <span>Browsing as</span>
      <SelectDropdown
        label="Choose who is browsing"
        value={user.id}
        options={users.map((item) => ({ value: item.id, label: item.name }))}
        className="user-select"
        onChange={(id) => {
          const nextUser = users.find((item) => item.id === id);
          if (nextUser) onChange(nextUser);
        }}
      />
    </label>
  );
}
