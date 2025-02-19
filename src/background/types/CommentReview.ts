import { Author } from './Author';
import { Book } from './Book';

export interface CommentReview {
	abstract: string;
	atUserVids: any[];
	bookId: string;
	bookVersion: number;
	content: string;
	friendship: number;
	htmlContent: string;
	isPrivate: number;
	range: string;
	star: number;
	title: string;
	topicRanges: string[];
	type: number;
	reviewId: string;
	userVid: number;
	topics: any[];
	createTime: number;
	newRatingLevel: number;
	isLike: number;
	isReposted: number;
	book: Book;
	author: Author;
}
