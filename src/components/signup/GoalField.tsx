import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const GoalField = ({ value, onChange }: GoalFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="goal">목표</Label>
      <Input
        id="goal"
        type="text"
        placeholder="예: 5kg 감량, 근육 증가 등"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

export default GoalField;