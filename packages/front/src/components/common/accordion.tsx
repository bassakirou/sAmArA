import React, { useState } from "react";
import cn from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { heightCollapse } from "@utils/motion/height-collapse";
import { useTranslation } from "next-i18next";

const sanitizeRichTextHtml = (input: string) => {
	let html = String(input ?? "");

	html = html.replace(/\u0000/g, "");
	html = html.replace(/<!--[\s\S]*?-->/g, "");
	html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
	html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/\s*>/gi, "");

	html = html.replace(/<\s*a\b([^>]*)>/gi, (_match, attrs) => {
		const hrefMatch = String(attrs ?? "").match(
			/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
		);
		const hrefRaw = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
		const href = hrefRaw.trim();
		const isSafe =
			!href ||
			/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);

		if (!isSafe) {
			return "<a>";
		}

		const safeHref = href
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		return safeHref
			? `<a href="${safeHref}" target="_blank" rel="nofollow noopener noreferrer">`
			: "<a>";
	});

	html = html.replace(/<\s*(\/?)\s*([a-z0-9]+)(\s[^>]*)?>/gi, (_m, slash, tag) => {
		const normalizedTag = String(tag ?? "").toLowerCase();
		if (normalizedTag === "a") {
			return `<${slash}${normalizedTag}>`;
		}
		return `<${slash}${normalizedTag}>`;
	});

	return html;
};

const isHtmlLike = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

type CollapseProps = {
	i: number;
	titleKey?: string;
	title?: string;
	content?: any;
	contentKey?: any;
	expanded: number;
	translatorNS: string;
	setExpanded: any;
	variant?: "gray" | "transparent";
};

export const Collapse: React.FC<CollapseProps> = ({
	i,
	expanded,
	setExpanded,
	titleKey,
	title,
	content,
	contentKey,
	translatorNS,
	variant = "gray",
}) => {
	const isOpen = i === expanded;

	const { t } = useTranslation(translatorNS);
	return (
		<div
			className={cn({
				"rounded-md bg-gray-200": variant === "gray",
				"shadow-sm": isOpen,
			})}
		>
			<motion.header
				initial={false}
				onClick={() => setExpanded(isOpen ? false : i)}
				className={cn(
					"cursor-pointer flex items-center justify-between transition-colors py-5 md:py-6",
					{
						"px-6 md:px-8 lg:px-10": variant === "gray",
						"border-t border-gray-300": variant === "transparent",
					}
				)}
			>
				<h2
					className={cn(
						"text-sm font-semibold leading-relaxed text-heading ltr:pr-2 rtl:pl-2",
						{
							"md:text-base": variant === "gray",
							"md:text-base lg:text-lg": variant === "transparent",
						}
					)}
				>
					{titleKey ? t(titleKey) : title}
				</h2>
				<div className="flex-shrink-0 relative w-4 h-4 flex justify-center items-center">
					<div className="w-full h-0.5 bg-heading rounded-sm" />
					<div
						className={`origin-bottom transform w-0.5 h-full bg-heading rounded-sm absolute bottom-0 transition-transform duration-500 ease-in-out ${
							isOpen ? "scale-0" : "scale-100"
						}`}
					/>
				</div>
			</motion.header>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						key="content"
						initial="from"
						animate="to"
						exit="from"
						variants={heightCollapse()}
					>
						<div
							className={cn("pb-6 md:pb-7", {
								"pt-5 border-t border-gray-300 px-6 md:px-8 lg:px-10":
									variant === "gray",
							})}
						>
							{contentKey ? (
								t(contentKey)
							) : typeof content === "string" && isHtmlLike(content) ? (
								<div
									className="richText"
									dangerouslySetInnerHTML={{
										__html: sanitizeRichTextHtml(content),
									}}
								/>
							) : (
								<div className="richText">{content}</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

type AccordionProps = {
	translatorNS: string;
	items: {
		titleKey?: string;
		title?: string;
		contentKey?: string;
		content?: string;
	}[];
	variant?: "gray" | "transparent";
};

const Accordion: React.FC<AccordionProps> = ({
	items,
	translatorNS,
	variant = "gray",
}) => {
	const [expanded, setExpanded] = useState<number>(0);

	return (
		<>
			{items?.map((item, index) => (
				<Collapse
					i={index}
					key={item.titleKey ?? item.title ?? index}
					titleKey={item.titleKey}
					title={item.title}
					contentKey={item.contentKey}
					content={item.content}
					expanded={expanded}
					setExpanded={setExpanded}
					variant={variant}
					translatorNS={translatorNS}
				/>
			))}
		</>
	);
};

export default Accordion;
