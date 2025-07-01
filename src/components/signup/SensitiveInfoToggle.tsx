import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SensitiveInfoToggleProps {
  showSensitive: boolean;
  setShowSensitive: (value: boolean) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
}

const SensitiveInfoToggle = ({
  showSensitive,
  setShowSensitive,
  birthday,
  setBirthday,
  gender,
  setGender,
  height,
  setHeight,
  weight,
  setWeight,
}: SensitiveInfoToggleProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>선택 정보 입력</Label>
        <Switch
          checked={showSensitive}
          onCheckedChange={setShowSensitive}
        />
      </div>
      {showSensitive && (
        <div className="space-y-4 mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            해당 정보를 입력하시면 챗봇이 더 정확한 도움을 드릴 수 있습니다.
          </p>

          <div className="space-y-2">
            <Label htmlFor="birthday">생년월일</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>성별</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="gender-male" />
                <Label htmlFor="gender-male">남성</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="gender-female" />
                <Label htmlFor="gender-female">여성</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">키 (cm)</Label>
            <Input
              id="height"
              type="number"
              min="0"
              step="0.1"
              placeholder="ex) 170.2"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">몸무게 (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              placeholder="ex) 65.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SensitiveInfoToggle;