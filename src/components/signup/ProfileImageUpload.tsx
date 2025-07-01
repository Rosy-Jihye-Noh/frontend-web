import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProfileImageUploadProps {
  onChange: (file: File | null) => void;
}

const ProfileImageUpload = ({ onChange }: ProfileImageUploadProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="profile-image">프로필 이미지 업로드</Label>
      <Input
        id="profile-image"
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default ProfileImageUpload;