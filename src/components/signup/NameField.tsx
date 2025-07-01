import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const NameField = ({ value, onChange }: NameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">유저명</Label>
      <Input
        id="name"
        type="text"
        placeholder="해당 사이트에서 이용하실 유저명을 입력해주세요."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

export default NameField;