import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export const OptimizedImage = React.memo(({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHR4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDzHvn+r1r1BAH/Z',
  ...props
}: OptimizedImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={cn('object-cover', className)}
    priority={priority}
    placeholder={placeholder}
    blurDataURL={blurDataURL}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    {...props}
  />
))

OptimizedImage.displayName = 'OptimizedImage'

// 專門用於頭像的優化組件
export const OptimizedAvatar = React.memo(({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={cn('rounded-full', className)}
    {...props}
  />
))

OptimizedAvatar.displayName = 'OptimizedAvatar'
