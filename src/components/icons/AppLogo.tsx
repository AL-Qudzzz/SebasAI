import Image from 'next/image';

export function AppLogo() {
  return (
    <Image
      src="https://i.imgur.com/ONPGKul.jpeg"
      alt="CurhatYuk Logo"
      width={40}
      height={40}
      className="rounded-lg"
      priority
    />
  );
}
