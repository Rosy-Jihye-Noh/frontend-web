import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SensitiveInfoToggle from "./SensitiveInfoToggle";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // 민감 정보 관련 state
  const [showSensitive, setShowSensitive] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // 프로필 이미지 파일 선택 핸들러
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 여기서 백엔드 API 호출 or form 데이터 처리
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("goal", goal);
    if (profileImage) formData.append("profileImage", profileImage);
    if (showSensitive) {
      formData.append("birthday", birthday);
      formData.append("gender", gender);
      formData.append("height", height);
      formData.append("weight", weight);
    }

    // 예시) fetch or axios 요청 등
    // fetch('/api/signup', { method: 'POST', body: formData })

    alert("회원가입 처리 준비 완료!");
  };

  return (
    <Card className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="********"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="goal">운동 목표</Label>
          <Input
            id="goal"
            type="text"
            placeholder="예: 체중 감량, 근력 증가"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="profileImage">프로필 사진</Label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            className="mt-1"
          />
        </div>

        {/* 민감 정보 토글 컴포넌트 */}
        <SensitiveInfoToggle
          showSensitive={showSensitive}
          setShowSensitive={setShowSensitive}
          birthday={birthday}
          setBirthday={setBirthday}
          gender={gender}
          setGender={setGender}
          height={height}
          setHeight={setHeight}
          weight={weight}
          setWeight={setWeight}
        />

        <Button type="submit" className="w-full !mt-6 bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-transform">
          가입하기
        </Button>
      </form>
    </Card>
  );
};

export default SignupForm;
