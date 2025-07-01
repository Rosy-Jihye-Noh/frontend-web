import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ConfirmPasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ConfirmPasswordField = ({ value, onChange }: ConfirmPasswordFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="confirm-password">비밀번호 확인</Label>
      <Input
        id="confirm-password"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default ConfirmPasswordField;