import React from 'react';
import ProfileImage from '@/components/common/ProfileImage';
import AuthenticatedImage from '@/components/common/AuthenticatedImage';

/**
 * 인증된 이미지 사용 예시 컴포넌트
 * 이 컴포넌트는 다양한 상황에서 인증이 필요한 이미지를 어떻게 사용하는지 보여줍니다.
 */
const AuthenticatedImageExamples: React.FC = () => {
  const currentUserId = 204; // 예시 사용자 ID

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">인증된 이미지 사용 예시</h1>

      {/* 1. 기본 프로필 이미지 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. 프로필 이미지 (ProfileImage 컴포넌트)</h2>
        <div className="flex items-center space-x-4">
          <ProfileImage 
            userId={currentUserId}
            alt="사용자 프로필"
          />
          <div>
            <p className="text-sm text-gray-600">
              제공해주신 예시 코드와 동일한 패턴으로 구현된 ProfileImage 컴포넌트입니다.
            </p>
            <p className="text-sm text-gray-600">
              ❌ 기존: &lt;img src="http://localhost:8081/api/users/204/profile-image" /&gt;
            </p>
            <p className="text-sm text-green-600">
              ✅ 개선: &lt;ProfileImage userId={204} /&gt;
            </p>
          </div>
        </div>
      </section>

      {/* 2. 다양한 크기의 프로필 이미지 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. 다양한 크기의 프로필 이미지</h2>
        <div className="flex items-center space-x-4">
          <ProfileImage 
            userId={currentUserId}
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            alt="작은 프로필"
          />
          <ProfileImage 
            userId={currentUserId}
            style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            alt="중간 프로필"
          />
          <ProfileImage 
            userId={currentUserId}
            style={{ width: '120px', height: '120px', borderRadius: '50%' }}
            alt="큰 프로필"
          />
        </div>
      </section>

      {/* 3. 일반적인 인증 이미지 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. 일반 인증 이미지 (AuthenticatedImage 컴포넌트)</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <AuthenticatedImage 
            src="/users/204/profile-image"
            alt="프로필 이미지"
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
            fallbackSrc="/images/default-avatar.png"
          />
          <AuthenticatedImage 
            src="/posts/123/images/1"
            alt="게시글 이미지"
            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
            fallbackSrc="/images/placeholder-image.png"
          />
        </div>
      </section>

      {/* 4. 코드 비교 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. 기존 방식 vs 개선된 방식</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="font-semibold text-red-600 mb-2">❌ 문제가 있던 기존 방식:</h3>
            <code className="text-sm bg-red-50 p-2 rounded block">
              &lt;img src="http://localhost:8081/api/users/204/profile-image" /&gt;
            </code>
            <p className="text-sm text-red-600 mt-1">
              → Authorization 헤더 없이 요청되어 401 Unauthorized 에러 발생
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-green-600 mb-2">✅ 개선된 방식:</h3>
            <code className="text-sm bg-green-50 p-2 rounded block">
              &lt;ProfileImage userId={204} /&gt;<br/>
              &lt;AuthenticatedImage src="/users/204/profile-image" alt="프로필" /&gt;
            </code>
            <p className="text-sm text-green-600 mt-1">
              → JWT 토큰이 포함된 요청으로 안전하게 이미지 로드
            </p>
          </div>
        </div>
      </section>

      {/* 5. 작동 원리 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. 작동 원리</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>axios 요청:</strong> Authorization 헤더와 함께 이미지 데이터를 Blob으로 다운로드</li>
            <li><strong>Object URL 생성:</strong> URL.createObjectURL()로 임시 브라우저 URL 생성</li>
            <li><strong>안전한 렌더링:</strong> &lt;img src={`{blobUrl}`} /&gt;로 이미지 표시</li>
            <li><strong>메모리 정리:</strong> 컴포넌트 언마운트 시 URL.revokeObjectURL()로 정리</li>
          </ol>
        </div>
      </section>
    </div>
  );
};

export default AuthenticatedImageExamples;
