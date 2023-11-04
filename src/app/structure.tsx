"use client";

import React from 'react'

export default function Structure({ children, theme }: { children: React.ReactNode, theme: string }) {
    return (
        <div className=''>
            <main className=''>
                {children}
            </main>

        </div>
    )
}