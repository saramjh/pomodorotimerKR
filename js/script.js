class PomodoroTimer {
	constructor(canvasId, defaultWorkTime, defaultBreakTime) {
		this.canvas = document.getElementById(canvasId)
		this.ctx = this.canvas.getContext("2d")
		this.defaultWorkTime = defaultWorkTime
		this.defaultBreakTime = defaultBreakTime
		this.workTime = defaultWorkTime
		this.breakTime = defaultBreakTime
		this.timeLeft = this.workTime
		this.totalTime = this.workTime
		this.isRunning = false
		this.isWorkSession = true
		this.timer = null
		this.historyList = document.getElementById("historyList")
		this.sessionTypeElement = document.getElementById("sessionType")
		this.updateTimerDisplay() // 초기화 시 타이머 표시
		this.updateInputFields() // 초기화 시 입력 필드 업데이트
		this.updateSessionType() // 초기화 시 세션 타입 표시
	}

	drawTimer() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		// Draw outer circle
		this.ctx.beginPath()
		this.ctx.arc(150, 150, 140, 0, 2 * Math.PI)
		this.ctx.fillStyle = "#f4f4f4"
		this.ctx.fill()
		this.ctx.lineWidth = 10
		this.ctx.strokeStyle = "#ddd"
		this.ctx.stroke()

		// Draw progress arc from center
		const startAngle = -Math.PI / 2
		const endAngle = startAngle + (2 * Math.PI * this.timeLeft) / this.totalTime
		this.ctx.beginPath()
		this.ctx.moveTo(150, 150) // Move to center
		this.ctx.arc(150, 150, 140, startAngle, endAngle, false)
		this.ctx.closePath() // Close the path to form a sector
		this.ctx.fillStyle = this.isWorkSession ? "#ff6347" : "#98fb98" // Red for work, pastel green for break
		this.ctx.fill()

		// Draw time text
		const minutes = Math.floor(this.timeLeft / 60)
		const seconds = this.timeLeft % 60
		this.ctx.font = "24px Arial"
		this.ctx.fillStyle = "#333"
		this.ctx.textAlign = "center"
		this.ctx.textBaseline = "middle"
		this.ctx.fillText(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`, 150, 150)
	}

	updateTimerDisplay() {
		this.drawTimer()
	}

	startTimer() {
		if (!this.isRunning) {
			this.isRunning = true
			this.timer = setInterval(() => {
				if (this.timeLeft > 0) {
					this.timeLeft--
					this.updateTimerDisplay()
				} else {
					clearInterval(this.timer)
					this.isRunning = false
					this.completeSession()
				}
			}, 1000)
		}
	}

	stopTimer() {
		clearInterval(this.timer)
		this.isRunning = false
	}

	resetTimer() {
		clearInterval(this.timer)
		this.isRunning = false
		this.timeLeft = this.isWorkSession ? this.defaultWorkTime : this.defaultBreakTime
		this.totalTime = this.timeLeft
		this.updateTimerDisplay()
		this.updateInputFields()
		this.canvas.classList.remove("shake")
	}

	completeSession() {
		this.addHistory()
		this.canvas.classList.add("shake")
		setTimeout(() => {
			this.canvas.classList.remove("shake")
			alert("타이머가 완료되었습니다!") // 경고 창 추가
			this.flipCard()
		}, 700)
	}

	flipCard() {
		const card = document.getElementById("timerCard")
		card.classList.toggle("flip")
		setTimeout(() => {
			this.isWorkSession = !this.isWorkSession
			this.timeLeft = this.isWorkSession ? this.workTime : this.breakTime
			this.totalTime = this.timeLeft
			this.updateTimerDisplay()
			this.updateInputFields()
			this.updateSessionType()
			this.canvas.classList.toggle("flipped") // 좌우 반전
		}, 500)
	}

	toggleSession() {
		this.flipCard()
	}

	setTimeFromTouch(x, y) {
		const rect = this.canvas.getBoundingClientRect()
		const centerX = rect.left + this.canvas.width / 2
		const centerY = rect.top + this.canvas.height / 2
		const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2
		const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI) // Normalize angle to [0, 2π]
		const maxTime = this.isWorkSession ? this.workTime : this.breakTime
		const newTime = Math.floor((normalizedAngle / (2 * Math.PI)) * maxTime)
		this.timeLeft = newTime > 0 ? newTime : this.totalTime
		this.totalTime = this.timeLeft
		this.updateTimerDisplay()
		this.updateInputFields()
	}

	setTimeFromInput() {
		const minutes = parseInt(document.getElementById("minuteInput").value) || 0
		const seconds = parseInt(document.getElementById("secondInput").value) || 0
		this.timeLeft = minutes * 60 + seconds
		this.totalTime = this.timeLeft
		this.updateTimerDisplay()
	}

	updateInputFields() {
		const minutes = Math.floor(this.timeLeft / 60)
		const seconds = this.timeLeft % 60
		document.getElementById("minuteInput").value = minutes
		document.getElementById("secondInput").value = seconds
	}

	updateSessionType() {
		this.sessionTypeElement.textContent = this.isWorkSession ? "집중 시간" : "휴식 시간"
	}

	addHistory() {
		const sessionType = this.isWorkSession ? "집중 시간" : "휴식 시간"
		const listItem = document.createElement("li")
		listItem.textContent = `${sessionType} 완료: ${new Date().toLocaleTimeString()}`

		const deleteBtn = document.createElement("button")
		deleteBtn.textContent = "삭제"
		deleteBtn.className = "delete-btn"
		deleteBtn.onclick = () => listItem.remove()

		listItem.appendChild(deleteBtn)
		this.historyList.appendChild(listItem)
	}
}

const pomodoroTimer = new PomodoroTimer("timerCanvas", 25 * 60, 5 * 60)

document.getElementById("start").addEventListener("click", () => pomodoroTimer.startTimer())
document.getElementById("stop").addEventListener("click", () => pomodoroTimer.stopTimer())
document.getElementById("reset").addEventListener("click", () => pomodoroTimer.resetTimer())
document.getElementById("toggleSession").addEventListener("click", () => pomodoroTimer.toggleSession())

document.getElementById("minuteInput").addEventListener("input", () => pomodoroTimer.setTimeFromInput())
document.getElementById("secondInput").addEventListener("input", () => pomodoroTimer.setTimeFromInput())

canvas.addEventListener("click", (event) => {
	pomodoroTimer.setTimeFromTouch(event.clientX, event.clientY)
})

pomodoroTimer.updateTimerDisplay()
