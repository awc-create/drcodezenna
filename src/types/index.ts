export interface BlogPost {
  id: string;
  title: string;
  author: string;
  summary: string;
  image: string;
  content: string;
  createdAt: string;
  mediaId?: string;
}

export interface TeachingPost {
  id: string;
  title: string;
  school: string;
  year: string;
  type: string;
  isCurrent: boolean;
  tags: string[];
  description: string;
  fullText: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploaded: string;
  blogPosts: BlogPost[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  interests: string[];
  location?: string;
  subscribedAt: string;
}

export interface HeroSection {
  id: string;
  heading: string;
  subheading: string;
  imageUrl: string;
  updatedAt: string;
}
