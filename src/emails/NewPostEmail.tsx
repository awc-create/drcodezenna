// src/emails/NewPostEmail.tsx
type Props = {
  postTitle: string;
  postType: 'Blog' | 'Teaching';
  postUrl: string;
};

export default function NewPostEmail({ postTitle, postType, postUrl }: Props) {
  return (
    <div>
      <p>Hi there,</p>
      <p>
        A new {postType.toLowerCase()} titled <strong>{postTitle}</strong> has
        just been published.
      </p>
      <p>
        <a href={postUrl} target="_blank" rel="noopener noreferrer">
          Click here to read it
        </a>
      </p>
      <p>— Dr. Odera Ezenna</p>
    </div>
  );
}
