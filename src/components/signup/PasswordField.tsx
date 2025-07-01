import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const PasswordField = ({ value, onChange }: PasswordFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">비밀번호</Label>
      <Input
        id="password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default PasswordField;