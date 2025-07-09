import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { X, PlusCircle, Edit2, Folder, MessageSquare, Heart, User, Trash2 } from "lucide-react";

type Post = { 
    id: string; 
    category?: string; 
    categoryName?: string;
    categoryId?: string;
    title: string; 
    userId?: string;
    authorId?: string;
    author?: string; 
    authorName?: string;
    username?: string;
    user?: User; // 조인된 사용자 정보
    likes?: number; 
    likeCount?: number;
    comments?: number; 
    commentCount?: number;
    createdAt?: string;
    updatedAt?: string;
};
type Category = { id: string; name: string; };
type User = { id: string; name: string; username?: string; email?: string; };

const EditableCategoryBadge: React.FC<{ category: Category; onUpdate: (id: string, newName: string) => void; onDelete: (id: string) => void; }> = ({ category, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

    const handleUpdate = () => {
        if (name.trim() && name !== category.name) onUpdate(category.id, name.trim());
        setIsEditing(false);
    };
    
    if (isEditing) return <Input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onBlur={handleUpdate} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} className="h-8 w-auto inline-flex border-gray-300 focus-visible:ring-blue-500/50" />;
    return (
        <Badge variant="outline" className="px-3 py-1.5 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-blue-300 transition-all group">
            <Folder className="h-3 w-3 mr-1.5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            {category.name}
            <button onClick={() => setIsEditing(true)} className="ml-2 hover:bg-blue-100 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-blue-600" />
            </button>
            <button onClick={() => onDelete(category.id)} className="ml-1 hover:bg-red-50 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100">
                <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
            </button>
        </Badge>
    );
};

export const ContentManagementPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // 카테고리 ID를 이름으로 변환하는 헬퍼 함수
    const getCategoryName = (categoryId: string | undefined): string => {
        if (!categoryId) return '미분류';
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || '미분류';
    };

    // 사용자 ID를 이름으로 변환하는 헬퍼 함수
    const getUserName = (userId: string | undefined): string => {
        if (!userId) return '익명';
        const user = users.find(u => u.id === userId);
        return user?.name || user?.username || '익명';
    };

    // 게시글에서 작성자 이름을 가져오는 헬퍼 함수
    const getAuthorName = (post: Post): string => {
        // 1. 조인된 사용자 정보가 있는 경우
        if (post.user) {
            return post.user.name || post.user.username || '익명';
        }
        // 2. 직접 포함된 작성자 정보가 있는 경우
        if (post.author || post.authorName || post.username) {
            return post.author || post.authorName || post.username || '익명';
        }
        // 3. 사용자 ID로 조회
        return getUserName(post.userId || post.authorId);
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm("정말 이 카테고리를 삭제하시겠습니까?\n연결된 게시글이 없어야 삭제 가능합니다.")) return;
        try {
            await apiClient.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(cat => String(cat.id) !== String(id)));
            alert("카테고리가 삭제되었습니다.");
        } catch (error) {
            // @ts-ignore
            if (error.response && error.response.status === 409) {
                alert("카테고리에 속한 게시글이 있어 삭제할 수 없습니다.");
            } else {
                alert("카테고리 삭제에 실패했습니다.");
            }
        }
    };

    // 새 카테고리 추가 함수
    const handleAddCategory = async () => {
        const trimmedName = newCategoryName.trim();
        
        if (!trimmedName) {
            alert("카테고리 이름을 입력해주세요.");
            return;
        }

        // 중복 카테고리명 체크
        if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert("이미 존재하는 카테고리명입니다.");
            return;
        }

        try {
            const response = await apiClient.post<Category>('/categories', { 
                name: trimmedName 
            });
            setCategories(prev => [...prev, response.data]);
            setNewCategoryName('');
            setIsAddingCategory(false);
            alert("카테고리가 추가되었습니다.");
        } catch (error) {
            console.error('Failed to add category:', error);
            // @ts-ignore
            if (error.response && error.response.status === 409) {
                alert("이미 존재하는 카테고리명입니다.");
            } else {
                alert("카테고리 추가에 실패했습니다.");
            }
        }
    };

    // 카테고리 추가 취소 함수
    const handleCancelAddCategory = () => {
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 옵션 1: 별도 사용자 API가 있는 경우
                try {
                    const [catResponse, postResponse, userResponse] = await Promise.all([
                        apiClient.get<Category[]>('/categories'),
                        apiClient.get<Post[]>('/posts'),
                        apiClient.get<User[]>('/users')
                    ]);
                    console.log('Categories response:', catResponse.data);
                    console.log('Posts response:', postResponse.data);
                    console.log('Users response:', userResponse.data);
                    setCategories(catResponse.data);
                    setPosts(postResponse.data);
                    setUsers(userResponse.data);
                } catch (userError) {
                    // 옵션 2: 사용자 정보가 포함된 게시글 목록 가져오기
                    console.log('Users API not available, trying posts with joined user info');
                    const [catResponse, postResponse] = await Promise.all([
                        apiClient.get<Category[]>('/categories'),
                        apiClient.get<Post[]>('/posts?include=user,category')
                    ]);
                    console.log('Categories response:', catResponse.data);
                    console.log('Posts with joined data response:', postResponse.data);
                    setCategories(catResponse.data);
                    setPosts(postResponse.data);
                }
            } catch (err) {
                console.error('API Error:', err);
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateCategory = async (id: string, newName: string) => {
        const oldName = categories.find(c => c.id === id)?.name;
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat));
        
        try {
            await apiClient.patch(`/categories/${id}`, { name: newName });
        } catch (err) {
            alert("카테고리 수정에 실패했습니다.");
            setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: oldName || '' } : cat));
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

        const originalPosts = [...posts];
        setPosts(prev => prev.filter(p => p.id !== postId));

        try {
            await apiClient.delete(`/posts/${postId}`);
        } catch (error) {
            alert("게시글 삭제에 실패했습니다.");
            setPosts(originalPosts);
        }
    };

    const renderContent = () => {
        if (loading) return <TableCaption>게시글 목록을 불러오는 중...</TableCaption>;
        if (error) return <TableCaption>{error}</TableCaption>;
        if (posts.length === 0) return <TableCaption>표시할 게시글이 없습니다.</TableCaption>;
        
        console.log('Rendering posts:', posts);
        
        return (
            <TableBody>
                {posts.map((post) => {
                    // 다양한 필드명에 대응
                    const categoryName = post.category || post.categoryName || getCategoryName(post.categoryId) || '미분류';
                    const authorName = getAuthorName(post);
                    const likeCount = post.likes || post.likeCount || 0;
                    const commentCount = post.comments || post.commentCount || 0;
                    
                    return (
                        <TableRow key={post.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                            <TableCell className="font-medium text-gray-700 dark:text-gray-200">
                                <div className="flex items-center gap-2">
                                    <Folder className="h-4 w-4 text-blue-500/70" />
                                    {categoryName}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-gray-800 dark:text-gray-100">
                                {post.title}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    {authorName}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 text-red-400">
                                        <Heart className="h-4 w-4" />
                                        <span className="text-gray-600 dark:text-gray-300">{likeCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-400">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-gray-600 dark:text-gray-300">{commentCount}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-400 transition-all"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        );
    }

    return (
        <MainLayout>
            <PageHeader title="콘텐츠 관리" />
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm mb-6 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Folder className="h-5 w-5 text-blue-500/70" />
                        카테고리 관리
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <EditableCategoryBadge key={cat.id} category={cat} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory} />
                        ))}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                            onClick={() => setIsAddingCategory(true)}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            카테고리 추가
                        </Button>
                        {isAddingCategory && (
                            <div className="flex items-center gap-2 mt-2 w-full">
                                <Input 
                                    value={newCategoryName} 
                                    onChange={(e) => setNewCategoryName(e.target.value)} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddCategory();
                                        if (e.key === 'Escape') handleCancelAddCategory();
                                    }}
                                    placeholder="새 카테고리 이름" 
                                    className="h-9 max-w-xs border-gray-300 dark:border-gray-600 focus-visible:ring-blue-500/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    autoFocus
                                />
                                <Button 
                                    onClick={handleAddCategory} 
                                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={!newCategoryName.trim()}
                                >
                                    추가
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancelAddCategory} 
                                    className="h-9 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    취소
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* ...카테고리 추가 폼 등... */}
                </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500/70" />
                        게시글 목록
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className="bg-white dark:bg-gray-800">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4 text-blue-500/60" />
                                        카테고리
                                    </div>
                                </TableHead>
                                <TableHead className="w-[45%] font-semibold text-gray-700 dark:text-gray-200">제목</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        작성자
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-gray-500" />
                                        <MessageSquare className="h-4 w-4 text-gray-500" />
                                        반응
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-200">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        {renderContent()}
                    </Table>
                </CardContent>
            </Card>
        </MainLayout>
    );
};