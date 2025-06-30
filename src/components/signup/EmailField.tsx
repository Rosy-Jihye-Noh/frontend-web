import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const EmailField = ({ value, onChange }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">이메일</Label>
      <Input
        id="email"
        type="email"
        placeholder="rosy1997@synergym.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default EmailField;