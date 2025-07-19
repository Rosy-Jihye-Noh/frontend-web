import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/api/axiosInstance';
import { MainLayout } from '@/components/common/AdminLayout';
import { PageHeader } from '@/components/common/AdminHeader';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { X, PlusCircle, Edit2, Folder, MessageSquare, Heart, User, Trash2, Loader2 } from "lucide-react";

type Post = { id: string; category?: string; categoryName?: string; categoryId?: string; title: string; userId?: string; authorId?: string; author?: string; authorName?: string; username?: string; user?: UserData; likes?: number; likeCount?: number; comments?: number; commentCount?: number; createdAt?: string; updatedAt?: string; };
type Category = { id: string; name: string; };
type UserData = { id: string; name: string; username?: string; email?: string; };

const EditableCategoryBadge: React.FC<{ category: Category; onUpdate: (id: string, newName: string) => void; onDelete: (id: string) => void; }> = ({ category, onUpdate, onDelete }) => {
    // ... (로직은 변경되지 않음, 스타일만 조정)
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);
    const handleUpdate = () => { if (name.trim() && name !== category.name) onUpdate(category.id, name.trim()); setIsEditing(false); };

    if (isEditing) return <Input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onBlur={handleUpdate} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} className="h-8 w-auto inline-flex border-gray-300 focus-visible:ring-blue-500/50" />;
    return (
        <Badge variant="outline" className="px-3 py-1.5 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-blue-300 transition-all group dark:bg-neutral-700/50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700">
            <Folder className="h-3 w-3 mr-1.5 text-gray-500 group-hover:text-blue-500 transition-colors dark:text-neutral-400" />
            {category.name}
            <button onClick={() => setIsEditing(true)} className="ml-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100">
                <Edit2 className="h-3 w-3 text-gray-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400" />
            </button>
            <button onClick={() => onDelete(category.id)} className="ml-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100">
                <X className="h-3 w-3 text-gray-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400" />
            </button>
        </Badge>
    );
};

export const ContentManagementPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    // ... (모든 핸들러 및 헬퍼 함수 로직은 변경되지 않음)
    const getCategoryName = (categoryId: string | undefined): string => { if (!categoryId) return '미분류'; const category = categories.find(cat => cat.id === categoryId); return category?.name || '미분류'; };
    const getUserName = (userId: string | undefined): string => { if (!userId) return '익명'; const user = users.find(u => u.id === userId); return user?.name || user?.username || '익명'; };
    const getAuthorName = (post: Post): string => { if (post.user) { return post.user.name || post.user.username || '익명'; } if (post.author || post.authorName || post.username) { return post.author || post.authorName || post.username || '익명'; } return getUserName(post.userId || post.authorId); };
    const handleDeleteCategory = async (id: string) => { if (!window.confirm("정말 이 카테고리를 삭제하시겠습니까?\n연결된 게시글이 없어야 삭제 가능합니다.")) return; try { await apiClient.delete(`/categories/${id}`); setCategories(prev => prev.filter(cat => String(cat.id) !== String(id))); alert("카테고리가 삭제되었습니다."); } catch (error) { const e = error as any; if (e.response && e.response.status === 409) { alert("카테고리에 속한 게시글이 있어 삭제할 수 없습니다."); } else { alert("카테고리 삭제에 실패했습니다."); } } };
    const handleAddCategory = async () => { const trimmedName = newCategoryName.trim(); if (!trimmedName) { alert("카테고리 이름을 입력해주세요."); return; } if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) { alert("이미 존재하는 카테고리명입니다."); return; } try { const response = await apiClient.post<Category>('/categories', { name: trimmedName }); setCategories(prev => [...prev, response.data]); setNewCategoryName(''); setIsAddingCategory(false); alert("카테고리가 추가되었습니다."); } catch (error) { console.error('Failed to add category:', error); const e = error as any; if (e.response && e.response.status === 409) { alert("이미 존재하는 카테고리명입니다."); } else { alert("카테고리 추가에 실패했습니다."); } } };
    const handleCancelAddCategory = () => { setNewCategoryName(''); setIsAddingCategory(false); };
    const handleUpdateCategory = async (id: string, newName: string) => { const oldName = categories.find(c => c.id === id)?.name; setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: newName } : cat)); try { await apiClient.patch(`/categories/${id}`, { name: newName }); } catch (err) { alert("카테고리 수정에 실패했습니다."); setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: oldName || '' } : cat)); } };
    const handleDeletePost = async (postId: string) => { if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return; const originalPosts = [...posts]; setPosts(prev => prev.filter(p => p.id !== postId)); try { await apiClient.delete(`/posts/${postId}`); } catch (error) { alert("게시글 삭제에 실패했습니다."); setPosts(originalPosts); } };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [catResponse, postResponse, userResponse] = await Promise.all([
                    apiClient.get<Category[]>('/categories'),
                    apiClient.get<Post[]>('/posts?include=user,category'), // user, category 정보를 join해서 가져오는 것을 기본으로 가정
                    apiClient.get<UserData[]>('/users')
                ]);
                setCategories(catResponse.data);
                setPosts(postResponse.data);
                setUsers(userResponse.data);
            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (loading) return <TableCaption><div className="flex items-center justify-center gap-2 p-4"><Loader2 className="h-5 w-5 animate-spin" /> 목록을 불러오는 중...</div></TableCaption>;
        if (error) return <TableCaption>{error}</TableCaption>;
        if (posts.length === 0) return <TableCaption>표시할 게시글이 없습니다.</TableCaption>;
        
        return (
            <TableBody>
                {posts.map((post) => {
                    const categoryName = post.categoryName || getCategoryName(post.categoryId);
                    const authorName = getAuthorName(post);
                    const likeCount = post.likeCount || 0;
                    const commentCount = post.commentCount || 0;
                    
                    return (
                        <TableRow key={post.id} className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/60 transition-colors">
                            <TableCell className="font-medium text-gray-700 dark:text-neutral-200">
                                <Badge variant="secondary">{categoryName}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-gray-800 dark:text-neutral-100">{post.title}</TableCell>
                            <TableCell><div className="flex items-center gap-2 text-gray-600 dark:text-neutral-300"><User className="h-4 w-4 text-gray-400" />{authorName}</div></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-400" /><span>{likeCount}</span></div>
                                    <div className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-blue-400" /><span>{commentCount}</span></div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                                    <Trash2 className="h-4 w-4 mr-1.5" />삭제
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
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Folder className="h-5 w-5 text-blue-600" /> 카테고리 관리</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => <EditableCategoryBadge key={cat.id} category={cat} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory} />)}
                            {!isAddingCategory && (
                                <Button variant="outline" size="sm" className="h-9 border-dashed" onClick={() => setIsAddingCategory(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />카테고리 추가
                                </Button>
                            )}
                            {isAddingCategory && (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') handleCancelAddCategory(); }} placeholder="새 카테고리 이름" className="h-9 max-w-xs" autoFocus />
                                    <Button onClick={handleAddCategory} className="h-9" disabled={!newCategoryName.trim()}>추가</Button>
                                    <Button variant="ghost" onClick={handleCancelAddCategory} className="h-9">취소</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600" /> 게시글 목록</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>카테고리</TableHead>
                                    <TableHead className="w-[40%]">제목</TableHead>
                                    <TableHead>작성자</TableHead>
                                    <TableHead>반응</TableHead>

                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            {renderContent()}
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};