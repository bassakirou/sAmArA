import cn from "classnames";
import React, { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	variant?: "normal" | "vert" | "rouge" | "outline" | "disabled";
	size?: "big" | "medium" | "small";
	active?: boolean;
	loading?: boolean;
	disabled?: boolean;
}
const classes = {
	root: "sam-btn text-light border border-transparent",
	normal:"bg-yellow-500",
    vert: "vert bg-green-600",
    rouge: "rouge bg-red-600",
    outline:
		"border border-border-400 bg-transparent text-body hover:text-light hover:bg-green-600 hover:border-green-800",
	loading:
		"h-4 w-4 ms-2 rounded-full border-2 border-transparent border-t-2 animate-spin",
	disabled:
		"border border-border-base bg-gray-300 border-border-400 text-body cursor-not-allowed",
	disabledOutline: "border border-border-base text-muted cursor-not-allowed",
	small: "px-3 py-0 h-9 text-sm h-10",
	medium: "px-5 py-0 h-12",
	big: "px-10 py-0 h-14",
};

const ButtonSamara = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => {
		const {
			className,
			variant = "normal",
			size = "medium",
			children,
			active,
			loading = false,
			disabled = false,
			...rest
		} = props;
		const classesName = cn(
			classes.root,
			{
				[classes.normal]: !disabled && variant === "normal",
				[classes.disabled]: disabled && variant === "disabled",
                [classes.vert]: !disabled && variant === "vert",
                [classes.rouge]: !disabled && variant === "rouge",
				[classes.small]: size === "small",
				[classes.medium]: size === "medium",
				[classes.big]: size === "big",
			},
			className
		);

		return (
			<button
				aria-pressed={active}
				data-variant={variant}
				ref={ref}
				className={classesName}
				disabled={disabled}
				{...rest}
			>
                <span className="btn-text">{children}</span>
                <span className="item1"></span><span className="item2"></span>
				{loading && (
					<span
						className={classes.loading}
						style={{
							borderTopColor:
								variant === "outline" ? "currentColor" : "#ffffff",
						}}
					/>
				)}
			</button>
		);
	}
);

export default ButtonSamara;